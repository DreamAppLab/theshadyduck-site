const fs = require("fs");

const navbar = fs.readFileSync("components/Navbar.tsx", "utf8");
const match = navbar.match(/const LOGO_SRC = ("[^"]+")/);
if (!match) {
  throw new Error("Could not find LOGO_SRC in Navbar.tsx");
}

fs.writeFileSync("lib/logo.ts", `export const LOGO_SRC = ${match[1]};\n`, "utf8");
console.log("Wrote lib/logo.ts");
