const fs = require("fs");
const { initializeApp, getApps, getApp } = require("firebase/app");
const {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} = require("firebase/firestore");
const { getFirestore } = require("firebase/firestore");

if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    process.env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const approvedQuery = query(
    collection(db, "sightings"),
    where("approved", "==", true),
    orderBy("createdAt", "desc"),
    limit(13),
  );

  const approvedSnap = await getDocs(approvedQuery);

  console.log("Approved sightings:", approvedSnap.size);
  approvedSnap.docs.forEach((doc) => {
    const data = doc.data();
    console.log("-", doc.id, data.locationName || data.city, "approved=", data.approved);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
