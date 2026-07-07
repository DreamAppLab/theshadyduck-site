const fs = require("fs");

const navbarPath = "components/Navbar.tsx";
let navbar = fs.readFileSync(navbarPath, "utf8");
navbar = navbar.replace(
  /import Link from "next\/link";\r?\n\r?\nconst LOGO_SRC = "[^"]+";\r?\n/,
  'import Link from "next/link";\nimport { LOGO_SRC } from "@/lib/logo";\n\n',
);
fs.writeFileSync(navbarPath, navbar, "utf8");
console.log("Updated Navbar.tsx");
