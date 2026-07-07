import Link from "next/link";

export function formatLegalDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LegalFooter({
  alternateLabel,
  alternateHref,
}: {
  alternateLabel: string;
  alternateHref: string;
}) {
  return (
    <footer>
      <div className="fine legal-footer-links">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> · </span>
        <Link href={alternateHref}>{alternateLabel}</Link>
      </div>
      <div className="fine">The Shady Duck · theshadyduck.com</div>
    </footer>
  );
}
