const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const files = [
  "scripts/html-utils.cjs",
  "scripts/css-utils.cjs",
  "scripts/run-migrate.cjs",
  "next.config.ts",
  "lib/firebase.ts",
  ".env.local.example",
  "eslint.config.mjs",
];

for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const buf = fs.readFileSync(full);
  if (buf.length >= 2 && buf[1] === 0) {
    fs.writeFileSync(full, buf.toString("utf16le"), "utf8");
    console.log("converted", rel);
  }
}
