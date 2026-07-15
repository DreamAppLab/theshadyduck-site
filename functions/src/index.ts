import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const ADMIN_EMAIL = "eddieskehan@gmail.com";
const BREVO_SENDER_EMAIL = "lab@dreamapplab.com";

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

async function sendBrevoEmail({
  subject,
  textContent,
  htmlContent,
}: {
  subject: string;
  textContent: string;
  htmlContent: string;
}) {
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
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: ADMIN_EMAIL,
          },
        ],
        subject,
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
    const reviewUrl = "https://theshadyduck.com/admin/review";
    await sendBrevoEmail({
      subject: "New Shady Duck sighting submitted for review",
      textContent: [
        "A new Shady Duck sighting was submitted for review.",
        "",
        `Submitter: ${name}`,
        `Location: ${location}`,
        `Description: ${notes?.trim() || "No description provided."}`,
        "",
        `Review now: ${reviewUrl}`,
      ].join("\n"),
      htmlContent: `
        <p>A new Shady Duck sighting was submitted for review.</p>
        <p><strong>Submitter:</strong> ${name}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Description:</strong> ${notes?.trim() || "No description provided."}</p>
        <p><a href="${reviewUrl}">Open admin review queue</a></p>
      `,
    });
  },
);

export const onGrowRequestCreated = onDocumentCreated(
  {
    document: "growRequests/{requestId}",
    secrets: [brevoApiKey],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Someone";
    const email = typeof data.email === "string" && data.email.trim() ? data.email.trim() : "N/A";
    const streetAddress =
      typeof data.streetAddress === "string" && data.streetAddress.trim()
        ? data.streetAddress.trim()
        : "N/A";
    const city = typeof data.city === "string" && data.city.trim() ? data.city.trim() : "N/A";
    const state = typeof data.state === "string" && data.state.trim() ? data.state.trim() : "N/A";
    const postalCode =
      typeof data.postalCode === "string" && data.postalCode.trim()
        ? data.postalCode.trim()
        : "N/A";
    const country =
      typeof data.country === "string" && data.country.trim() ? data.country.trim() : "N/A";

    const fcmAddressLine = [
      streetAddress !== "N/A" ? streetAddress : null,
      [city !== "N/A" ? city : null, state !== "N/A" ? state : null, postalCode !== "N/A" ? postalCode : null]
        .filter(Boolean)
        .join(", ") || null,
    ]
      .filter(Boolean)
      .join(", ");

    await sendAdminNotifications(
      "New grow request",
      `${name} — ${fcmAddressLine || "address unavailable"}`,
    );

    await sendBrevoEmail({
      subject: "New Grow Request - Shady Duck",
      textContent: [
        "A new Help Us Grow request was submitted.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Address: ${streetAddress}`,
        `City: ${city}`,
        `State: ${state}`,
        `Zip: ${postalCode}`,
        `Country: ${country}`,
      ].join("\n"),
      htmlContent: `
        <p>A new Help Us Grow request was submitted.</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${streetAddress}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>State:</strong> ${state}</p>
        <p><strong>Zip:</strong> ${postalCode}</p>
        <p><strong>Country:</strong> ${country}</p>
      `,
    });
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
