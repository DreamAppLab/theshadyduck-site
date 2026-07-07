import { existsSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const GEOCODE_DELAY_MS = 200;

function loadEnvFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!existsSync(fullPath)) return;

  for (const line of readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function resolveImportPackageRoot() {
  const candidates = [
    path.join(ROOT, "import-package"),
    path.join(ROOT, "import-package", "import-package"),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "manifest.json"))) {
      return candidate;
    }
  }

  throw new Error(
    "Could not find import-package/manifest.json. Expected import-package/manifest.json or import-package/import-package/manifest.json.",
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function componentValue(components, type, useShort = false) {
  const component = components.find((entry) => entry.types.includes(type));
  if (!component) return null;
  return useShort ? component.short_name : component.long_name;
}

function parseGeocodeResult(result) {
  const components = result.address_components ?? [];
  const city =
    componentValue(components, "locality") ||
    componentValue(components, "postal_town") ||
    componentValue(components, "administrative_area_level_3") ||
    componentValue(components, "administrative_area_level_2");

  const state = componentValue(components, "administrative_area_level_1", true);
  const country = componentValue(components, "country");
  const lat = result.geometry?.location?.lat;
  const lng = result.geometry?.location?.lng;

  if (!city || !country || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return { city, state, country, lat, lng };
}

async function geocodeAddress(query, apiKey) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "OK" || !data.results?.length) {
    console.log("Geocode status:", data.status, data.error_message);
    return null;
  }

  return parseGeocodeResult(data.results[0]);
}

function parseManifestDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Timestamp.fromDate(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

function buildDownloadUrl(bucketName, storagePath, token) {
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;
}

async function uploadPhoto(bucket, sightingId, photoFile, localPhotoPath) {
  const storagePath = `sightings/${sightingId}/${photoFile}`;
  const token = randomUUID();
  const contentType = getContentType(photoFile);

  await bucket.upload(localPhotoPath, {
    destination: storagePath,
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return buildDownloadUrl(bucket.name, storagePath, token);
}

function initializeFirebase() {
  const serviceAccountPath = path.join(ROOT, "service-account.json");
  if (!existsSync(serviceAccountPath)) {
    throw new Error("Missing service-account.json in project root.");
  }

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "the-shady-duck.firebasestorage.app",
    });
  }

  return {
    db: getFirestore(),
    bucket: getStorage().bucket(),
  };
}

async function main() {
  loadEnvFile(".env.local");

  const apiKey = process.env.GEOCODING_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEOCODING_API_KEY in .env.local");
  }

  const packageRoot = resolveImportPackageRoot();
  const manifestPath = path.join(packageRoot, "manifest.json");
  const photosDir = path.join(packageRoot, "photos");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  const { db, bucket } = initializeFirebase();

  console.log(`Loaded ${manifest.length} entries from ${manifestPath}`);
  console.log(`Using photos directory: ${photosDir}`);

  const skipped = [];
  let succeeded = 0;

  for (let index = 0; index < manifest.length; index += 1) {
    const entry = manifest[index];
    const progress = `[${index + 1}/${manifest.length}]`;
    console.log(`${progress} Processing ${entry.photoFile}...`);

    const localPhotoPath = path.join(photosDir, entry.photoFile);
    if (!existsSync(localPhotoPath)) {
      console.warn(
        `${progress} WARNING: Photo file not found for ${entry.photoFile} at ${localPhotoPath}. Skipping.`,
      );
      skipped.push({
        photoFile: entry.photoFile,
        geocodeQuery: entry.geocodeQuery,
        reason: "missing photo file",
      });
      continue;
    }

    let geocoded;
    try {
      geocoded = await geocodeAddress(entry.geocodeQuery, apiKey);
      await sleep(GEOCODE_DELAY_MS);
    } catch (error) {
      console.warn(
        `${progress} WARNING: Geocoding error for ${entry.photoFile} (${entry.geocodeQuery}): ${error instanceof Error ? error.message : error}`,
      );
      skipped.push({
        photoFile: entry.photoFile,
        geocodeQuery: entry.geocodeQuery,
        reason: "geocoding error",
      });
      continue;
    }

    if (!geocoded) {
      console.warn(
        `${progress} WARNING: Geocoding returned no results for ${entry.photoFile} (${entry.geocodeQuery}). Skipping Firestore document.`,
      );
      skipped.push({
        photoFile: entry.photoFile,
        geocodeQuery: entry.geocodeQuery,
        reason: "no geocoding results",
      });
      continue;
    }

    const sightingRef = db.collection("sightings").doc();
    const sightingId = sightingRef.id;

    try {
      const photoUrl = await uploadPhoto(bucket, sightingId, entry.photoFile, localPhotoPath);
      const notes = entry.notes?.trim() ? entry.notes.trim() : null;

      await sightingRef.set({
        name: entry.name?.trim() || null,
        city: geocoded.city,
        state: geocoded.state,
        country: geocoded.country,
        lat: geocoded.lat,
        lng: geocoded.lng,
        locationName: entry.geocodeQuery,
        notes,
        photoUrl,
        approved: true,
        createdAt: parseManifestDate(entry.date),
        importedHistorical: true,
      });

      succeeded += 1;
      console.log(
        `${progress} OK ${entry.photoFile} -> ${sightingId} (${geocoded.city}, ${geocoded.state || geocoded.country})`,
      );
    } catch (error) {
      console.warn(
        `${progress} WARNING: Upload/write failed for ${entry.photoFile}: ${error instanceof Error ? error.message : error}`,
      );
      skipped.push({
        photoFile: entry.photoFile,
        geocodeQuery: entry.geocodeQuery,
        reason: "upload or firestore write failed",
      });
    }
  }

  console.log("\nImport complete.");
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Total documents created: ${succeeded}`);

  if (skipped.length > 0) {
    console.log("\nSkipped entries:");
    for (const item of skipped) {
      console.log(`- ${item.photoFile} (${item.geocodeQuery}) [${item.reason}]`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
