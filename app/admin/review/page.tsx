"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { httpsCallable } from "firebase/functions";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  formatLocationDisplay,
  formatSightingDate,
  formatSubmitterName,
} from "@/lib/format-sighting";
import { auth, db, functions, getMessagingIfSupported } from "@/lib/firebase";
import {
  digitsOnly,
  formatUsPhoneDisplay,
  formatUsPhoneInput,
  toUsE164,
} from "@/lib/phone";
import {
  ADMIN_CONFIG_COLLECTION,
  ADMIN_NOTIFICATIONS_DOC,
  PRIVACY_POLICY_PATH,
  TERMS_OF_SERVICE_PATH,
} from "@/lib/site-links";
import type { Sighting } from "@/lib/sightings";

const ADMIN_EMAIL = "eddieskehan@gmail.com";
const FCM_TOKEN_KEY = "adminFcmToken";

interface PendingSighting extends Sighting {
  id: string;
}

function firebaseConfigParams(): string {
  return new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  }).toString();
}

async function registerAdminDevice(user: User, log: (message: string) => void) {
  if (!("Notification" in window) || Notification.permission === "denied") {
    log("FCM debug: Notification not supported or denied");
    return;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    log("FCM debug: no vapidKey");
    return;
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    log("FCM debug: messaging not supported on this device");
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      log("FCM debug: permission not granted, got: " + permission);
      return;
    }
  }

  const existingToken = localStorage.getItem(FCM_TOKEN_KEY);
  if (existingToken) {
    log("FCM debug: existing token found in localStorage, skipping");
    return;
  }

  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${firebaseConfigParams()}`,
  );

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    log("FCM debug: getToken returned no token");
    return;
  }

  log("FCM debug: got token, saving to Firestore");

  await setDoc(
    doc(db, "adminDevices", token),
    {
      email: user.email,
      userAgent: navigator.userAgent,
      registeredAt: new Date().toISOString(),
    },
    { merge: true },
  );

  localStorage.setItem(FCM_TOKEN_KEY, token);
  log("FCM debug: saved successfully");
}

export default function AdminReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [queue, setQueue] = useState<PendingSighting[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [savedPhoneE164, setSavedPhoneE164] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const phoneId = useId();

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog((current) => [...current, message]);
  };

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    setActionError(null);

    try {
      const pendingQuery = query(
        collection(db, "sightings"),
        where("approved", "==", false),
        orderBy("createdAt", "asc"),
      );
      const snapshot = await getDocs(pendingQuery);

      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt;

        return {
          id: docSnap.id,
          name: data.name ?? null,
          locationName: data.locationName ?? null,
          city: data.city,
          state: data.state ?? null,
          country: data.country,
          lat: data.lat,
          lng: data.lng,
          notes: data.notes ?? null,
          photoUrl: data.photoUrl,
          approved: false,
          createdAt:
            createdAt && typeof createdAt.toDate === "function"
              ? createdAt.toDate()
              : null,
        } satisfies PendingSighting;
      });

      setQueue(items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load moderation queue.";
      setActionError(message);
      setQueue([]);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const loadNotificationPreferences = useCallback(async () => {
    setPhoneLoading(true);
    setPhoneError(null);

    try {
      const configRef = doc(db, ADMIN_CONFIG_COLLECTION, ADMIN_NOTIFICATIONS_DOC);
      const snapshot = await getDoc(configRef);
      const smsRecipientPhone = snapshot.data()?.smsRecipientPhone;

      if (typeof smsRecipientPhone === "string" && smsRecipientPhone) {
        setSavedPhoneE164(smsRecipientPhone);
        setPhoneDigits(digitsOnly(smsRecipientPhone).replace(/^1/, ""));
      } else {
        setSavedPhoneE164(null);
        setPhoneDigits("");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load notification preferences.";
      setPhoneError(message);
    } finally {
      setPhoneLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setAuthLoading(true);
      setAuthError(null);

      if (nextUser && nextUser.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setUser(null);
        setAuthError("Not authorized");
        setAuthLoading(false);
        return;
      }

      setUser(nextUser);

      if (nextUser) {
        try {
          await registerAdminDevice(nextUser, addDebugLog);
          await Promise.all([loadQueue(), loadNotificationPreferences()]);
        } catch (error) {
          console.error("Admin setup failed:", error);
          const message = error instanceof Error ? error.message : String(error);
          setAuthError(`Device registration failed: ${message}`);
        }
      } else {
        setQueue([]);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, [loadQueue, loadNotificationPreferences]);

  const handlePhoneChange = (value: string) => {
    setPhoneSuccess(null);
    setPhoneError(null);
    setPhoneDigits(digitsOnly(value).slice(0, 10));
  };

  const handleSavePhone = async () => {
    setPhoneSaving(true);
    setPhoneError(null);
    setPhoneSuccess(null);

    const e164 = toUsE164(phoneDigits);
    if (!e164) {
      setPhoneError("Enter a valid 10-digit US phone number.");
      setPhoneSaving(false);
      return;
    }

    try {
      await setDoc(
        doc(db, ADMIN_CONFIG_COLLECTION, ADMIN_NOTIFICATIONS_DOC),
        {
          smsRecipientPhone: e164,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email ?? ADMIN_EMAIL,
        },
        { merge: true },
      );

      setSavedPhoneE164(e164);
      setPhoneSuccess(`Saved — you'll receive SMS alerts at ${formatUsPhoneDisplay(e164)}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save phone number.";
      setPhoneError(message);
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setAuthError(message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setQueue([]);
    setPhoneDigits("");
    setSavedPhoneE164(null);
    setPhoneSuccess(null);
    setPhoneError(null);
  };

  const handleApprove = async (sightingId: string) => {
    setActionId(sightingId);
    setActionError(null);

    try {
      const approveSighting = httpsCallable(functions, "approveSighting");
      await approveSighting({ sightingId });
      setQueue((current) => current.filter((item) => item.id !== sightingId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approve failed.";
      setActionError(message);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (sightingId: string) => {
    setActionId(sightingId);
    setActionError(null);

    try {
      const rejectSighting = httpsCallable(functions, "rejectSighting");
      await rejectSighting({ sightingId });
      setQueue((current) => current.filter((item) => item.id !== sightingId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reject failed.";
      setActionError(message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <Navbar />
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Admin</p>
          <h1 className="headline">Review Submissions</h1>
          <p>Approve new sightings or reject ones that don&apos;t meet the bar.</p>
        </div>
      </section>

      <section className="upload-section">
        <div className="wrap">
          <div className="upload-form admin-review-panel">
            {authLoading ? (
              <p className="form-hint">Checking sign-in...</p>
            ) : !user ? (
              <div className="admin-auth">
                <button className="btn primary form-submit" type="button" onClick={handleSignIn}>
                  Sign in with Google
                </button>
                {authError ? (
                  <p className="form-message form-message-error" role="alert">
                    {authError}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="admin-toolbar">
                  <p className="form-hint">Signed in as {user.email}</p>
                  <button className="btn secondary" type="button" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>

                <div className="upload-form admin-notification-panel">
                  <h2 className="admin-section-title">Notification Preferences</h2>

                  {savedPhoneE164 ? (
                    <p className="admin-current-phone" role="status">
                      Currently receiving alerts at: {formatUsPhoneDisplay(savedPhoneE164)}
                    </p>
                  ) : null}

                  <div className="form-field">
                    <label className="form-label" htmlFor={phoneId}>
                      Phone Number
                    </label>
                    <input
                      id={phoneId}
                      className="form-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={formatUsPhoneInput(phoneDigits)}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                      placeholder="(555) 555-1234"
                      disabled={phoneLoading || phoneSaving}
                    />
                  </div>

                  <p className="admin-consent-text">
                    Enter your phone number to receive SMS alerts when a new duck sighting is
                    submitted for admin review. Message frequency varies. Msg &amp; data rates may
                    apply. Reply STOP to opt out, HELP for help. See our{" "}
                    <Link href={PRIVACY_POLICY_PATH}>Privacy Policy</Link> and{" "}
                    <Link href={TERMS_OF_SERVICE_PATH}>Terms of Service</Link>.
                  </p>

                  {phoneError ? (
                    <p className="form-message form-message-error" role="alert">
                      {phoneError}
                    </p>
                  ) : null}

                  {phoneSuccess ? (
                    <p className="form-message form-message-success" role="status">
                      {phoneSuccess}
                    </p>
                  ) : null}

                  <button
                    className="btn primary form-submit admin-save-phone"
                    type="button"
                    onClick={handleSavePhone}
                    disabled={phoneLoading || phoneSaving || phoneDigits.length < 10}
                  >
                    {phoneSaving ? "Saving..." : "Save"}
                  </button>
                </div>

                {debugLog.length > 0 ? (
                  <pre
                    style={{
                      fontSize: "12px",
                      whiteSpace: "pre-wrap",
                      background: "#111",
                      color: "#0f0",
                      padding: "8px",
                      borderRadius: "4px",
                      marginTop: "8px",
                    }}
                  >
                    {debugLog.join("\n")}
                  </pre>
                ) : null}

                {actionError ? (
                  <p className="form-message form-message-error" role="alert">
                    {actionError}
                  </p>
                ) : null}

                {queueLoading ? (
                  <p className="form-hint">Loading queue...</p>
                ) : queue.length === 0 ? (
                  <p className="form-message form-message-success" role="status">
                    No pending submissions — you&apos;re all caught up!
                  </p>
                ) : (
                  <div className="admin-queue">
                    {queue.map((sighting) => (
                      <article key={sighting.id} className="admin-queue-item">
                        <img
                          className="admin-queue-photo"
                          src={sighting.photoUrl}
                          alt={formatSubmitterName(sighting.name)}
                        />
                        <div className="admin-queue-meta">
                          <div className="admin-queue-name">
                            {formatSubmitterName(sighting.name)}
                          </div>
                          <div className="admin-queue-location">
                            {formatLocationDisplay(sighting)}
                          </div>
                          {sighting.notes ? (
                            <p className="admin-queue-notes">&ldquo;{sighting.notes}&rdquo;</p>
                          ) : null}
                          <div className="admin-queue-date">
                            {formatSightingDate(sighting.createdAt)}
                          </div>
                          <div className="admin-queue-actions">
                            <button
                              className="btn primary"
                              type="button"
                              disabled={actionId === sighting.id}
                              onClick={() => handleApprove(sighting.id)}
                            >
                              {actionId === sighting.id ? "Working..." : "Approve"}
                            </button>
                            <button
                              className="btn secondary"
                              type="button"
                              disabled={actionId === sighting.id}
                              onClick={() => handleReject(sighting.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="fine">The Shady Duck · theshadyduck.com</div>
      </footer>
    </>
  );
}