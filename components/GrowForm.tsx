"use client";

import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { type FormEvent, useId, useState } from "react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { db } from "@/lib/firebase";
import { formatAddressPreview, type AddressData } from "@/lib/parse-address";

export default function GrowForm() {
  const nameId = useId();
  const emailId = useId();
  const notesId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<AddressData | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!address) {
      setError("Please select a mailing address from the dropdown.");
      return;
    }

    setSubmitting(true);

    try {
      const requestRef = doc(collection(db, "growRequests"));

      await setDoc(requestRef, {
        name: trimmedName,
        email: trimmedEmail,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        notes: notes.trim() || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess("Thanks! We'll get 5 Shady Ducks in the mail to you soon.");
      setName("");
      setEmail("");
      setNotes("");
      setAddress(null);
      setFormKey((current) => current + 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form key={formKey} className="upload-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor={nameId}>
          Name <span className="form-required">*</span>
        </label>
        <input
          id={nameId}
          className="form-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={submitting}
          required
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={emailId}>
          Email <span className="form-required">*</span>
        </label>
        <input
          id={emailId}
          className="form-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={submitting}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label className="form-label">
          Address <span className="form-required">*</span>
        </label>
        <AddressAutocomplete onAddressSelect={setAddress} disabled={submitting} />
        <p className="form-hint">
          Start typing your street address and choose from the suggestions.
        </p>
        {address ? (
          <p className="location-preview" role="status">
            Selected: {formatAddressPreview(address)}
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
          placeholder="Anything else you'd like us to know?"
          disabled={submitting}
          rows={4}
        />
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

      <button className="btn primary form-submit" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Request Shady Ducks"}
      </button>
    </form>
  );
}
