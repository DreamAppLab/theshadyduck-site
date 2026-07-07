import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

const ADMIN_EMAIL = "eddieskehan@gmail.com";

const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");
const adminPhoneNumber = defineSecret("ADMIN_PHONE_NUMBER");

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const messaging = getMessaging();
const bucket = getStorage().bucket();

function assertAdmin(request: CallableRequest) {
  const email = request.auth?.token?.email;
  if (!email || email !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Not authorized");
  }
}

async function sendAdminNotifications(title: string, body: string, imageUrl?: string) {
  const devicesSnapshot = await db.collection("adminDevices").get();
  if (devicesSnapshot.empty) return;

  const tokens = devicesSnapshot.docs.map((doc) => doc.id).filter(Boolean);
  if (!tokens.length) return;

  await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
      imageUrl,
    },
    webpush: imageUrl
      ? {
          notification: {
            icon: imageUrl,
          },
        }
      : undefined,
  });
}

async function sendAdminSms(message: string) {
  try {
    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber.value(),
      to: adminPhoneNumber.value(),
    });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

export const approveSighting = onCall(async (request) => {
  assertAdmin(request);

  const sightingId = request.data?.sightingId;
  if (typeof sightingId !== "string" || !sightingId) {
    throw new HttpsError("invalid-argument", "sightingId is required");
  }

  const sightingRef = db.collection("sightings").doc(sightingId);
  const sightingDoc = await sightingRef.get();

  if (!sightingDoc.exists) {
    throw new HttpsError("not-found", "Sighting not found");
  }

  await sightingRef.update({
    approved: true,
    approvedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

export const rejectSighting = onCall(async (request) => {
  assertAdmin(request);

  const sightingId = request.data?.sightingId;
  if (typeof sightingId !== "string" || !sightingId) {
    throw new HttpsError("invalid-argument", "sightingId is required");
  }

  const sightingRef = db.collection("sightings").doc(sightingId);
  const sightingDoc = await sightingRef.get();

  if (!sightingDoc.exists) {
    throw new HttpsError("not-found", "Sighting not found");
  }

  const data = sightingDoc.data();
  const photoUrl = data?.photoUrl;

  await sightingRef.delete();

  if (typeof photoUrl === "string") {
    const storagePath = extractStoragePath(photoUrl);
    if (storagePath) {
      await bucket.file(storagePath).delete({ ignoreNotFound: true });
    }
  }

  const prefix = `sightings/${sightingId}/`;
  const [files] = await bucket.getFiles({ prefix });
  await Promise.all(files.map((file) => file.delete({ ignoreNotFound: true })));

  return { success: true };
});

export const onSightingCreated = onDocumentCreated(
  {
    document: "sightings/{sightingId}",
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhoneNumber, adminPhoneNumber],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Anonymous";
    const location =
      (typeof data.locationName === "string" && data.locationName) ||
      [data.city, data.state, data.country].filter(Boolean).join(", ");
    const photoUrl = typeof data.photoUrl === "string" ? data.photoUrl : undefined;

    await sendAdminNotifications(
      "New sighting submitted",
      `${name} at ${location}`,
      photoUrl,
    );

    await sendAdminSms(`New Shady Duck sighting: ${name} at ${location}. Review at theshadyduck.com/admin/review`);
  },
);

export const onGrowRequestCreated = onDocumentCreated(
  {
    document: "growRequests/{requestId}",
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhoneNumber, adminPhoneNumber],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const name = typeof data.name === "string" ? data.name : "Someone";
    const city = typeof data.city === "string" ? data.city : "";
    const state = typeof data.state === "string" ? data.state : "";

    await sendAdminNotifications(
      "New grow request",
      `${name} requested ducks for ${[city, state].filter(Boolean).join(", ")}`,
    );

    await sendAdminSms(`New Shady Duck grow request from ${name} (${[city, state].filter(Boolean).join(", ")}). Review at theshadyduck.com/admin/review`);
  },
);

function extractStoragePath(photoUrl: string): string | null {
  try {
    const url = new URL(photoUrl);
    const match = url.pathname.match(/\/o\/(.+)/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}