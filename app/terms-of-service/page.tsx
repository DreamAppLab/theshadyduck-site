import Navbar from "@/components/Navbar";
import { formatLegalDate } from "@/components/LegalFooter";

const CONTACT_EMAIL = "lab@dreamapplab.com";

export default function TermsOfServicePage() {
  const lastUpdated = formatLegalDate();

  return (
    <>
      <Navbar />
      <section className="pagehead">
        <div className="wrap">
          <p className="eyebrow">Legal</p>
          <h1 className="headline">Terms of Service</h1>
          <p>Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="legal-section">
        <div className="wrap">
          <article className="legal-article">
            <p>
              Welcome to Shady Duck (theshadyduck.com). By using this site, you agree to these
              terms.
            </p>

            <h2>Using the Site</h2>
            <p>
              Shady Duck is a community platform for sharing photos and locations of rubber duck
              sightings. You may submit sightings for review. We reserve the right to approve,
              reject, or remove any submission at our discretion, for any reason, including
              inappropriate content, spam, or inaccurate information.
            </p>

            <h2>Submission Content</h2>
            <p>By submitting a photo or sighting, you confirm that:</p>
            <ul>
              <li>You own the photo or have the right to share it.</li>
              <li>The submission does not contain offensive, illegal, or infringing content.</li>
              <li>
                You grant Shady Duck a non-exclusive, royalty-free right to display the submitted
                content on the site and associated promotional materials.
              </li>
            </ul>

            <h2>Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Submit false, misleading, or spam content.</li>
              <li>Attempt to disrupt or gain unauthorized access to the site or its backend systems.</li>
              <li>Use the site for any unlawful purpose.</li>
            </ul>

            <h2>No Warranty</h2>
            <p>
              This site is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
              guarantee the site will be error-free, uninterrupted, or that submitted content will
              remain permanently available.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Shady Duck and its operator are not liable for
              any indirect, incidental, or consequential damages arising from use of the site.
            </p>

            <h2>Changes to These Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the site after changes
              constitutes acceptance of the updated terms.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
