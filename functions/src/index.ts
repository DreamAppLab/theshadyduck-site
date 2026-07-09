import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const ADMIN_EMAIL = "eddieskehan@gmail.com";

const brevoApiKey = defineSecret("BREVO_API_KEY");

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

async function sendAdminBrevoEmail({
  name,
  location,
  notes,
}: {
  name: string;
  location: string;
  notes: string | null;
}) {
  const reviewUrl = "https://theshadyduck.com/admin/review";
  const textContent = [
    "A new Shady Duck sighting was submitted for review.",
    "",
    `Submitter: ${name}`,
    `Location: ${location}`,
    `Description: ${notes?.trim() || "No description provided."}`,
    "",
    `Review now: ${reviewUrl}`,
  ].join("\n");
  const htmlContent = `
    <p>A new Shady Duck sighting was submitted for review.</p>
    <p><strong>Submitter:</strong> ${name}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Description:</strong> ${notes?.trim() || "No description provided."}</p>
    <p><a href="${reviewUrl}">Open admin review queue</a></p>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey.value(),
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Shady Duck",
          email: "lab@dreamapplab.com",
        },
        to: [
          {
            email: "eddieskehan@gmail.com",
          },
        ],
        subject: "New Shady Duck sighting submitted for review",
        textContent,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Failed to send Brevo email:", response.status, body);
    }
  } catch (error) {
    console.error("Failed to send Brevo email:", error);
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
    secrets: [brevoApiKey],
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

    const notes = typeof data.notes === "string" ? data.notes : null;
    await sendAdminBrevoEmail({ name, location, notes });
  },
);

export const onGrowRequestCreated = onDocumentCreated(
  {
    document: "growRequests/{requestId}",
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