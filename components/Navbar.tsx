import Link from "next/link";
import { LOGO_SRC } from "@/lib/logo";


type NavLink = "home" | "spottings" | "upload" | "grow" | "about" | "contact";

interface NavbarProps {
  currentLink?: NavLink;
}

function navClass(current: string | undefined, link: string) {
  return current === link ? "current" : undefined;
}

export default function Navbar({ currentLink }: NavbarProps) {
  return (
    <nav className="topbar">
      <div className="navrow">
        <div className="brand">
          <img className="nav-logo" src={LOGO_SRC} alt="The Shady Duck logo" />
          <span>The Shady Duck</span>
        </div>
        <div className="navlinks">
          <Link href="/" className={navClass(currentLink, "home")}>Latest Sighting</Link>
          <Link href="/spottings" className={navClass(currentLink, "spottings")}>Spottings</Link>
          <Link href="/upload" className={navClass(currentLink, "upload")}>Upload a Photo</Link>
          <Link href="#" className={navClass(currentLink, "grow")}>Help Us Grow</Link>
          <Link href="#" className={navClass(currentLink, "about")}>About</Link>
          <Link href="#" className={navClass(currentLink, "contact")}>Contact</Link>
        </div>
      </div>
    </nav>
  );
}
