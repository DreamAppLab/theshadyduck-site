import Navbar from "@/components/Navbar";
import { formatLegalDate } from "@/components/LegalFooter";

const CONTACT_EMAIL = "lab@dreamapplab.com";

export default function PrivacyPolicyPage() {
  const lastUpdated = formatLegalDate();

  return (
    <>
      <Navbar />
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Legal</p>
          <h1 className="headline">Privacy Policy</h1>
          <p>Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="legal-section">
        <div className="wrap">
          <article className="legal-article">
            <p>
              Shady Duck (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates theshadyduck.com, a community
              website for sharing rubber duck sighting photos and locations. This policy explains
              what information we collect and how we use it.
            </p>

            <h2>Information We Collect</h2>
            <ul>
              <li>
                <strong>Sighting submissions:</strong> When you submit a duck sighting, we collect
                the photo, location, description, and any other details you provide.
              </li>
              <li>
                <strong>Admin account:</strong> The site administrator signs in using Google
                Sign-In. We store the administrator&apos;s email and, if provided, phone number for
                SMS notification purposes.
              </li>
              <li>
                <strong>Usage data:</strong> We may use standard hosting and analytics tools (such
                as Vercel Analytics) that collect basic technical information like pages visited and
                general location (city/region level), not precise location data about you
                personally.
              </li>
            </ul>

            <h2>How We Use Information</h2>
            <ul>
              <li>To display approved duck sightings publicly on the site.</li>
              <li>To review and moderate submissions before they go live.</li>
              <li>
                To send SMS notifications to the site administrator when a new sighting is submitted
                for review (opt-in, admin only — see SMS Notifications below).
              </li>
            </ul>

            <h2>SMS Notifications</h2>
            <p>
              If the site administrator opts in to SMS alerts, we use Twilio to send text messages
              notifying them of new sighting submissions awaiting review. Message frequency varies
              based on submission volume. Message and data rates may apply. Reply STOP to any message
              to opt out, or HELP for assistance. Phone numbers used for SMS alerts are not shared
              with third parties except our SMS service provider (Twilio) as needed to deliver
              messages.
            </p>

            <h2>Third-Party Services</h2>
            <p>We use the following third-party services to operate this site:</p>
            <ul>
              <li>
                Google Firebase (Firestore, Cloud Functions, Storage) — for data storage and backend
                processing
              </li>
              <li>Google Sign-In — for administrator authentication</li>
              <li>Twilio — for SMS delivery</li>
              <li>Vercel — for website hosting</li>
            </ul>
            <p>
              These providers may process data on our behalf subject to their own privacy policies.
            </p>

            <h2>Data Retention</h2>
            <p>
              Submitted sighting data (photos, descriptions, locations) is retained as part of the
              public sighting archive unless removed by the administrator. Administrator contact
              information is retained until the administrator updates or removes it.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              This site is not directed at children under 13, and we do not knowingly collect
              personal information from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with
              an updated date.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
