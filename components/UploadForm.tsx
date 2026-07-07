"use client";

import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { type FormEvent, useEffect, useId, useState } from "react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { db, storage } from "@/lib/firebase";
import { formatLocationPreview, type LocationData } from "@/lib/parse-place";

export default function UploadForm() {
  const nameId = useId();
  const notesId = useId();
  const photoId = useId();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [photo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!photo) {
      setError("Please select a photo.");
      return;
    }

    if (!location) {
      setError("Please select a location from the dropdown.");
      return;
    }

    setUploading(true);

    try {
      const sightingRef = doc(collection(db, "sightings"));
      const sightingId = sightingRef.id;
      const storageRef = ref(storage, `sightings/${sightingId}/${photo.name}`);

      await uploadBytes(storageRef, photo);
      const photoUrl = await getDownloadURL(storageRef);

      await setDoc(
        sightingRef,
        {
          name: name.trim() || null,
          locationName: location.locationName,
          city: location.city,
          state: location.state,
          country: location.country,
          lat: location.lat,
          lng: location.lng,
          notes: notes.trim() || null,
          photoUrl,
          approved: false,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      setSuccess(
        "Thanks! Your sighting is being reviewed and will show up here once approved.",
      );
      setName("");
      setNotes("");
      setPhoto(null);
      setLocation(null);
      setFormKey((current) => current + 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form key={formKey} className="upload-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor={nameId}>
          Name <span className="form-optional">(optional)</span>
        </label>
        <input
          id={nameId}
          className="form-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={uploading}
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label className="form-label">
          Location <span className="form-required">*</span>
        </label>
        <LocationAutocomplete onLocationSelect={setLocation} disabled={uploading} />
        <p className="form-hint">
          Start typing a city, campground, landmark, or place name and choose from the
          suggestions.
        </p>
        {location ? (
          <p className="location-preview" role="status">
            Selected: {formatLocationPreview(location)}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={notesId}>
          Notes <span className="form-optional">(optional)</span>
        </label>
        <textarea
          id={notesId}
          className="form-textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything you want to tell us about this one?"
          disabled={uploading}
          rows={4}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={photoId}>
          Photo <span className="form-required">*</span>
        </label>
        <input
          id={photoId}
          className="form-file"
          type="file"
          accept="image/*"
          required
          disabled={uploading}
          onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
        />
        {photoPreview ? (
          <div className="photo-preview">
            <img src={photoPreview} alt="Selected sighting preview" />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="form-message form-message-error" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="form-message form-message-success" role="status">
          {success}
        </p>
      ) : null}

      <button className="btn primary form-submit" type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Submit Sighting"}
      </button>
    </form>
  );
}
