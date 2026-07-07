import Link from "next/link";
import { PRIVACY_POLICY_PATH, TERMS_OF_SERVICE_PATH } from "@/lib/site-links";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <Link href={PRIVACY_POLICY_PATH}>Privacy Policy</Link>
        <span aria-hidden="true"> · </span>
        <Link href={TERMS_OF_SERVICE_PATH}>Terms of Service</Link>
      </div>
      <div className="site-footer-copy">&copy; {year} Shady Duck</div>
    </footer>
  );
}
