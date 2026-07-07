const fs = require("fs");
const path = require("path");
const {
  extractStyle,
  extractBody,
  extractNavLogoSrc,
  stripNav,
  htmlToJsx,
} = require("./html-utils.cjs");
const { buildGlobalsCss } = require("./css-utils.cjs");

const ROOT = path.resolve(__dirname, "..");

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

function writePage(outPath, pageName, currentLink, bodyHtml, pageClass = "") {
  const jsxBody = htmlToJsx(stripNav(bodyHtml));
  const wrapperOpen = pageClass ? `<div className="${pageClass}">` : "";
  const wrapperClose = pageClass ? `</div>` : "";
  const currentLinkProp = currentLink ? ` currentLink="${currentLink}"` : "";
  const content = `import Navbar from "@/components/Navbar";

export default function ${pageName}() {
  return (
    <>
      <Navbar${currentLinkProp} />
      ${wrapperOpen}
${indent(jsxBody, 6)}
      ${wrapperClose}
    </>
  );
}
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
}

const logoSrc = extractNavLogoSrc(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"));
fs.mkdirSync(path.join(ROOT, "app"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "components"), { recursive: true });

const indexCss = extractStyle(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"));
const galleryCss = extractStyle(fs.readFileSync(path.join(ROOT, "gallery.html"), "utf8"));
const spottingsCss = extractStyle(fs.readFileSync(path.join(ROOT, "spottings.html"), "utf8"));
fs.writeFileSync(path.join(ROOT, "app", "globals.css"), buildGlobalsCss(indexCss, galleryCss, spottingsCss), "utf8");

const navbar = `import Link from "next/link";

const LOGO_SRC = ${JSON.stringify(logoSrc)};

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
          <Link href="/#upload" className={navClass(currentLink, "upload")}>Upload a Photo</Link>
          <Link href="#" className={navClass(currentLink, "grow")}>Help Us Grow</Link>
          <Link href="#" className={navClass(currentLink, "about")}>About</Link>
          <Link href="#" className={navClass(currentLink, "contact")}>Contact</Link>
        </div>
      </div>
    </nav>
  );
}
`;

fs.writeFileSync(path.join(ROOT, "components", "Navbar.tsx"), navbar, "utf8");

const layout = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Shady Duck",
  description: "Track sightings of The Shady Duck around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;700&family=Courier+Prime&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
`;

fs.writeFileSync(path.join(ROOT, "app", "layout.tsx"), layout, "utf8");

writePage(path.join(ROOT, "app", "page.tsx"), "HomePage", "home", extractBody(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")));
writePage(path.join(ROOT, "app", "gallery", "page.tsx"), "GalleryPage", "", extractBody(fs.readFileSync(path.join(ROOT, "gallery.html"), "utf8")), "page-gallery");
writePage(path.join(ROOT, "app", "spottings", "page.tsx"), "SpottingsPage", "spottings", extractBody(fs.readFileSync(path.join(ROOT, "spottings.html"), "utf8")));

console.log("Migration complete.");
