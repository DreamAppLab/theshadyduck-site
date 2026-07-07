function removeAtRuleBlock(css, atRulePrefix) {
  let result = css;
  let start = result.indexOf(atRulePrefix);
  while (start !== -1) {
    const braceStart = result.indexOf("{", start);
    let depth = 0;
    let end = braceStart;
    for (; end < result.length; end++) {
      if (result[end] === "{") depth++;
      else if (result[end] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    result = result.slice(0, start) + result.slice(end + 1);
    start = result.indexOf(atRulePrefix);
  }
  return result;
}

function stripSharedNavRules(css) {
  return removeAtRuleBlock(
    css
      .replace(/nav\.topbar\{[^}]+\}/, "")
      .replace(/\.navrow\{[^}]+\}/, "")
      .replace(/\.brand\{[^}]+\}/, "")
      .replace(/\.nav-logo\{[^}]+\}/, "")
      .replace(/\.brand span\{[^}]+\}/, "")
      .replace(/\.navlinks\{[^}]+\}/, "")
      .replace(/\.navlinks a\{[^}]+\}/, "")
      .replace(/\.navlinks a:hover[^}]*\{[^}]+\}/, "")
      .replace(/\.navlinks a\.current\{[^}]+\}/, ""),
    "@media (max-width:520px)",
  ).trim();
}

function buildGlobalsCss(indexCss, galleryCss, spottingsCss) {
  const marker = ".navlinks a.current{border-color:var(--gold);}";
  const galleryPageCss = stripSharedNavRules(galleryCss.split(marker)[1] || "").replace(
    /\.wrap\{max-width:1200px;margin:0 auto;padding:0 24px;\}/,
    "",
  );
  const spottingsPageCss = stripSharedNavRules(spottingsCss.split(marker)[1] || "");
  return `${indexCss}\n\n/* Shared subpage styles */\n${galleryPageCss}\n\n${spottingsPageCss}\n\n.page-gallery .wrap { max-width: 1200px; }\n`;
}

module.exports = { buildGlobalsCss };
