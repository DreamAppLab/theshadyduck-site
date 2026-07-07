const fs = require("fs");
const path = require("path");

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1].trim() : "";
}

function extractBody(html) {
  const m = html.match(/<body>([\s\S]*?)<\/body>/);
  return m ? m[1].trim() : "";
}

function extractNavLogoSrc(html) {
  const body = extractBody(html);
  const m = body.match(/<nav[\s\S]*?<img class="nav-logo" src="([^"]+)"/);
  return m ? m[1] : "";
}

function stripNav(body) {
  return body.replace(/<nav class="topbar">[\s\S]*?<\/nav>\s*/i, "");
}

function htmlToJsx(html) {
  let jsx = html;
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, "");
  jsx = jsx.replace(/\sclass=/g, " className=");
  jsx = jsx.replace(/\sfor=/g, " htmlFor=");
  jsx = jsx.replace(/stroke-width/g, "strokeWidth");
  jsx = jsx.replace(/text-anchor/g, "textAnchor");
  jsx = jsx.replace(/<img([^>]*?)(?<!\/)>/g, "<img$1 />");
  jsx = jsx.replace(/<br>/g, "<br />");
  jsx = jsx.replace(/style="([^"]*)"/g, (_, style) => {
    const obj = style
      .split(";")
      .filter(Boolean)
      .map((pair) => {
        const [rawKey, ...rest] = pair.split(":");
        const key = rawKey.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return `${key}: '${rest.join(":").trim()}'`;
      })
      .join(", ");
    return `style={{ ${obj} }}`;
  });
  jsx = jsx.replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"');
  jsx = jsx.replace(/href="index\.html"/g, 'href="/"');
  jsx = jsx.replace(/href="gallery\.html"/g, 'href="/gallery"');
  jsx = jsx.replace(/href="spottings\.html"/g, 'href="/spottings"');
  return jsx.trim();
}

module.exports = {
  extractStyle,
  extractBody,
  extractNavLogoSrc,
  stripNav,
  htmlToJsx,
};
