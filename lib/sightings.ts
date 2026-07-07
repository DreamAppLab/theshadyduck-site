import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Sighting {
  id: string;
  name: string | null;
  locationName: string | null;
  city: string;
  state: string | null;
  country: string;
  lat: number;
  lng: number;
  notes: string | null;
  photoUrl: string;
  approved: boolean;
  createdAt: Date | null;
}

const HOMEPAGE_LIMIT = 13;

function docToSighting(doc: QueryDocumentSnapshot): Sighting {
  const data = doc.data();
  const createdAt = data.createdAt;

  return {
    id: doc.id,
    name: data.name ?? null,
    locationName: data.locationName ?? null,
    city: data.city,
    state: data.state ?? null,
    country: data.country,
    lat: data.lat,
    lng: data.lng,
    notes: data.notes ?? null,
    photoUrl: data.photoUrl,
    approved: data.approved === true,
    createdAt:
      createdAt && typeof createdAt.toDate === "function" ? createdAt.toDate() : null,
  };
}

export async function getHomepageSightings(): Promise<Sighting[]> {
  try {
    const sightingsQuery = query(
      collection(db, "sightings"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      limit(HOMEPAGE_LIMIT),
    );

    const snapshot = await getDocs(sightingsQuery);
    return snapshot.docs.map(docToSighting);
  } catch (error) {
    console.error("Failed to load homepage sightings:", error);
    return [];
  }
}

export async function getGallerySightings(): Promise<Sighting[]> {
  try {
    const homepageQuery = query(
      collection(db, "sightings"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      limit(HOMEPAGE_LIMIT),
    );

    const homepageSnapshot = await getDocs(homepageQuery);

    if (homepageSnapshot.docs.length < HOMEPAGE_LIMIT) {
      return [];
    }

    const lastHomepageDoc = homepageSnapshot.docs[homepageSnapshot.docs.length - 1];
    const galleryQuery = query(
      collection(db, "sightings"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(lastHomepageDoc),
    );

    const gallerySnapshot = await getDocs(galleryQuery);
    return gallerySnapshot.docs.map(docToSighting);
  } catch (error) {
    console.error("Failed to load gallery sightings:", error);
    return [];
  }
}

export async function getAllApprovedSightings(): Promise<Sighting[]> {
  try {
    const sightingsQuery = query(
      collection(db, "sightings"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(sightingsQuery);
    return snapshot.docs.map(docToSighting);
  } catch (error) {
    console.error("Failed to load map sightings:", error);
    return [];
  }
}
