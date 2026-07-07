"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { collection, doc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  formatLocationDisplay,
  formatSightingDate,
  formatSubmitterName,
} from "@/lib/format-sighting";
import { auth, db, functions, getMessagingIfSupported } from "@/lib/firebase";
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

async function registerAdminDevice(user: User) {
  if (!("Notification" in window) || Notification.permission === "denied") {
    console.log("FCM debug: Notification not supported or denied");
    return;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.log("FCM debug: no vapidKey");
    return;
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    console.log("FCM debug: messaging not supported on this device");
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("FCM debug: permission not granted, got:", permission);
      return;
    }
  }

  const existingToken = localStorage.getItem(FCM_TOKEN_KEY);
  if (existingToken) {
    console.log("FCM debug: existing token found in localStorage, skipping");
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
    console.log("FCM debug: getToken returned no token");
    return;
  }

  console.log("FCM debug: got token, saving to Firestore");

  await setDoc(
    doc(db, "adminDevices", token),
    {
      email: user.email,
      userAgent: navigator.userAgent,
      registeredAt: new Date().toISOString(),
    },
    { merge: true },
  );

  localStorage.setItem(FCM_TOKEN_KEY,

export default function AdminReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [queue, setQueue] = useState<PendingSighting[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
          await registerAdminDevice(nextUser);
          await loadQueue();
        } catch (error) {
          console.error("Admin setup failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      setAuthError(`Device registration failed: ${message}`);
          console.error("Admin setup failed:", error);
        }
      } else {
        setQueue([]);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, [loadQueue]);

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
