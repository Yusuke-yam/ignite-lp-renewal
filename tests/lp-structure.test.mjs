import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const pagePath = "app/page.tsx";
const cssPath = "app/globals.css";
const revenueModelPath = "scripts/revenue-model-assets.json";
const revenueGeneratorPath = "scripts/generate-revenue-model-assets.py";

test("LP has the required narrative sections and diagnosis CTA", () => {
  assert.ok(existsSync(pagePath), "app/page.tsx should exist");
  const page = readFileSync(pagePath, "utf8");

  for (const sectionId of ["hero", "case-1", "case-2", "diagnosis"]) {
    assert.match(page, new RegExp(`(id="${sectionId}"|id: "${sectionId}")`), `${sectionId} section should be rendered`);
  }

  assert.match(page, /href="https:\/\/lin\.ee\/vQSfqnp"/, "CTA should link to the supplied LINE URL");
  assert.match(page, /target="_blank"/, "CTA should open the external LINE URL in a new tab");
  assert.match(page, /rel="noopener noreferrer"/, "CTA should safely open the external LINE URL");
  assert.match(page, /className="caseStack"/, "case examples should be wrapped so mobile can combine them into one panel");
  assert.match(page, /className="mobileCaseCta"/, "mobile should render a compact diagnosis CTA at the end of the case panel");
  assert.match(page, /mobileCaseCtaCatch/, "mobile CTA should use the same catch-copy placement as the desktop CTA");
  assert.match(page, /mobileCaseCtaFooter/, "mobile CTA should use the same footer-copy placement as the desktop CTA");
  assert.match(page, /desktopFinalCta/, "desktop should keep the full final CTA section");
  assert.doesNotMatch(page, /className="ctaButton ctaHitArea" href="#diagnosis"/, "CTA should no longer link back to the same section");
  assert.match(page, /生きたい生き方を/, "hero headline should match the reference");
  assert.match(page, /Before\/After 例1/, "case 1 title should match the reference");
  assert.match(page, /Before\/After 例2/, "case 2 title should match the reference");
});

test("hero copy reflects the updated coaching and monetization promises", () => {
  const page = readFileSync(pagePath, "utf8");

  for (const text of [
    "認知科学プロコーチ（認定率1桁台）",
    "認知科学×AIで",
    "すべての人が",
    "成果を出せる",
    "認定プロコーチと",
    "AIコンサルタントが",
    "伴走するので",
    "必ず結果が出る",
    "必ず収益化するまで伴走"
  ]) {
    assert.match(page, new RegExp(text), `${text} should be rendered in the hero section`);
  }

  assert.doesNotMatch(page, /認定準1桁合/, "old certification wording should be removed");
  assert.doesNotMatch(page, /潜在能力を解放/, "old badge copy should be removed");
  assert.doesNotMatch(page, /成果までの[^"]*最短ルートを設計/s, "old route-design badge copy should be removed");
});

test("LP uses the supplied core visual assets", () => {
  assert.ok(existsSync(pagePath), "app/page.tsx should exist");
  const page = readFileSync(pagePath, "utf8");

  for (const asset of [
    "/assets/hero-resort.png",
    "/assets/case-1-revenue-fixed.png",
    "/assets/case-2-revenue-fixed.png",
    "/assets/logo.png"
  ]) {
    assert.match(page, new RegExp(asset), `${asset} should be referenced by the page`);
    assert.ok(existsSync(`public${asset}`), `${asset} should be available in public assets`);
  }
});

test("text-heavy hero and CTA are rendered as sharp DOM text", () => {
  const page = readFileSync(pagePath, "utf8");

  assert.match(page, /className="heroTitle"/, "hero title should be DOM text");
  assert.match(page, /className="medalBadge"/, "hero badges should be DOM text and SVG");
  assert.match(page, /className=\{`[^`]*ctaButton[^`]*`\}/, "CTA should be DOM text");
  assert.doesNotMatch(page, /lp-hero(?:@2x)?\.png/, "hero should not be a rasterized text slice");
  assert.doesNotMatch(page, /lp-cta(?:@2x)?\.png/, "CTA should not be a rasterized text slice");
});

test("final CTA section uses the updated copy and centered footer treatment", () => {
  const page = readFileSync(pagePath, "utf8");
  const css = readFileSync(cssPath, "utf8");

  assert.match(page, /コーチング×AIで、人生の可能性を広げましょう/, "section 4 catch copy should be updated");
  assert.match(page, /コーチング・AIのプロが、あなたの未来に伴走します/, "section 4 footer copy should be updated");
  assert.doesNotMatch(page, /mobileCaseCtaLead/, "mobile CTA should not use the simplified lead-only layout");
  assert.doesNotMatch(page, /あなたの可能性を、AIでもっと広げよう/, "old section 4 catch copy should be removed");
  assert.doesNotMatch(page, /IgnAIte が、あなたの未来に伴走します/, "old section 4 footer copy should be removed");
  assert.doesNotMatch(page, /className="footerLogo"/, "section 4 should not render the bottom-right logo");

  assert.match(css, /\.ctaFooter\s*{[^}]*grid-template-columns:\s*1fr/s, "section 4 footer should center the copy in one column");
  assert.match(css, /\.ctaFooter\s*{[^}]*place-items:\s*center/s, "section 4 footer should center its content horizontally");
  assert.match(css, /\.timeBadge\s*{[^}]*font-family:[^}]*Hiragino Sans[^}]*Noto Sans JP[^}]*sans-serif/s, "time badge should use the same sans-serif family");
  assert.match(css, /\.mobileCaseCta\s*{[^}]*display:\s*none/s, "compact mobile CTA should stay hidden on desktop");
  assert.doesNotMatch(css, /\.timeBadge b\s*{[^}]*Georgia/s, "time badge value should not use the old serif font");
});

test("case images use high-resolution supplied artwork", () => {
  const expected = {
    "/assets/case-1-revenue-fixed.png": [1698, 926],
    "/assets/case-2-revenue-fixed.png": [1668, 943],
    "/assets/hero-resort.png": [1122, 1402]
  };

  for (const [asset, [width, height]] of Object.entries(expected)) {
    const png = readFileSync(`public${asset}`);
    assert.equal(png.readUInt32BE(16), width, `${asset} width should be high-resolution`);
    assert.equal(png.readUInt32BE(20), height, `${asset} height should be high-resolution`);
  }
});

test("case sections keep the reference aspect and do not stretch section 3", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /\.caseSection\s*{[^}]*aspect-ratio:\s*941\s*\/\s*489/s, "case sections should keep the reference section ratio");
  assert.match(css, /\.caseVisual\s*{[^}]*position:\s*absolute/s, "case artwork should be contained in a stable visual frame");
  assert.match(css, /\.caseImage\s*{[^}]*object-fit:\s*contain/s, "case artwork should not be cropped or stretched");
});

test("sections scale proportionally to one viewport panel", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /html\s*{[^}]*scroll-snap-type:\s*y\s+mandatory/s, "page should snap section-by-section vertically");
  assert.match(css, /\.lpCanvas\s*{[^}]*--px:\s*min\(calc\(100svw \/ 941\),\s*calc\(100svh \/ 489\)\)/s, "LP should define a viewport-based proportional scale");
  assert.match(css, /\.lpCanvas\s*{[^}]*width:\s*calc\(941 \* var\(--px\)\)/s, "LP canvas width should scale from the reference width");
  assert.match(css, /\.caseSection\s*{[^}]*width:\s*100%/s, "case sections should not grow wider than the scaled canvas");
  assert.match(css, /\.(heroSection|caseSection|finalCtaSection)\s*{[^}]*height:\s*100svh/s, "each LP section should occupy one screen height");
  assert.match(css, /\.(heroSection|caseSection|finalCtaSection)\s*{[^}]*scroll-snap-align:\s*start/s, "each LP section should snap at the top of the viewport");
  assert.match(css, /\.heroTitle\s*{[^}]*font-size:\s*calc\(50 \* var\(--px\)\)/s, "hero title should scale proportionally");
  assert.match(css, /\.caseTitle\s*{[^}]*width:\s*calc\(300 \* var\(--px\)\)/s, "case title should scale proportionally");
  assert.match(css, /\.ctaButton\s*{[^}]*width:\s*min\(100%,\s*calc\(752 \* var\(--px\)\)\)/s, "CTA button should scale proportionally");
});

test("mobile layout keeps each section readable without absolute-position drift", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.lpCanvas\s*{[^}]*--mobile-gutter:/s, "mobile layout should define a consistent gutter");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.heroSection\s*{[^}]*grid-template-rows:\s*minmax\(0,\s*auto\)\s+minmax\(0,\s*1fr\)/s, "mobile hero should reserve a flexible image row");
  assert.match(css, /\.caseStack\s*{[^}]*display:\s*contents/s, "desktop should keep case examples as independent snap sections");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack\s*{[^}]*height:\s*100svh/s, "mobile should combine both case examples into one viewport panel");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack\s*{[^}]*grid-template-rows:\s*auto\s+auto\s+auto/s, "mobile combined case panel should stack both examples and the compact CTA");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack\s*{[^}]*align-content:\s*end/s, "mobile combined case panel should keep the compact CTA flush with the bottom edge");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack\s*{[^}]*scroll-snap-align:\s*start/s, "mobile combined case panel should be the snap target");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCta\s*{[^}]*display:\s*grid/s, "mobile compact CTA should be visible inside the case panel");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCta\s*{[^}]*width:\s*100%/s, "mobile compact CTA should use a full-width PC-like CTA band");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCta\s*{[^}]*background:[^}]*var\(--navy-gradient\)/s, "mobile compact CTA should use the PC CTA navy treatment");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCtaCatch\s*{[^}]*display:\s*grid/s, "mobile compact CTA should show the catch copy above the button");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCtaCatch\s*{[^}]*white-space:\s*nowrap/s, "mobile compact CTA catch copy should stay on one line");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCtaFooter\s*{[^}]*display:\s*grid/s, "mobile compact CTA should show the footer copy below the button");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCtaFooter p\s*{[^}]*white-space:\s*nowrap/s, "mobile compact CTA footer copy should stay on one line");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.mobileCaseCta \.mobileCaseCtaFooter p\s*{[^}]*font-size:\s*clamp\(9px,\s*2\.55vw,\s*14px\)/s, "mobile compact CTA footer copy should override the generic CTA footer size");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.desktopFinalCta\s*{[^}]*display:\s*none/s, "mobile should not show the separate final CTA screen");
  assert.match(css, /@media\s*\(max-width:\s*430px\)\s*{[\s\S]*\.caseStack\s*{[^}]*align-content:\s*space-between/s, "narrow mobile case panel should distribute vertical whitespace evenly");
  assert.match(css, /@media\s*\(max-width:\s*430px\)\s*{[\s\S]*\.caseStack\s*{[^}]*gap:\s*0/s, "narrow mobile case panel should rely on grid distribution instead of fixed gaps");
  assert.match(css, /@media\s*\(max-width:\s*430px\)\s*{[\s\S]*\.caseStack \.caseSection,[\s\S]*\.caseStack \.caseSection \+ \.caseSection\s*{[^}]*display:\s*contents/s, "narrow mobile case examples should flatten into one evenly-spaced grid");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack \.caseSection,[\s\S]*\.caseStack \.caseSection \+ \.caseSection\s*{[^}]*grid-template-rows:\s*auto\s+auto/s, "mobile case sections should flow title then image inside the combined panel");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack \.caseSection,[\s\S]*\.caseStack \.caseSection \+ \.caseSection\s*{[^}]*height:\s*auto/s, "mobile individual case examples should not each consume one viewport");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseStack \.caseSection,[\s\S]*\.caseStack \.caseSection \+ \.caseSection\s*{[^}]*scroll-snap-align:\s*none/s, "mobile individual case examples should not snap separately");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseTitle\s*{[^}]*position:\s*relative/s, "mobile case title should not rely on desktop absolute positioning");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseTitle\s*{[^}]*transform:\s*none/s, "mobile case title should not use desktop translate positioning");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseTitle\s*{[^}]*animation-name:\s*sectionReveal/s, "mobile case title animation should not restore desktop translate positioning");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.heroTitle span\s*{[^}]*white-space:\s*normal/s, "mobile hero title lines should be allowed to wrap on narrow screens");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.heroTitle span\s*{[^}]*overflow-wrap:\s*anywhere/s, "mobile hero title should avoid horizontal overflow on very narrow screens");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.heroTitle,[\s\S]*\.heroLead,[\s\S]*\.badgeGrid\s*{[^}]*max-width:\s*calc\(100vw\s*-\s*\(var\(--mobile-gutter\)\s*\*\s*2\)\)/s, "mobile hero text and badges should stay inside the viewport gutter");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.caseVisual\s*{[^}]*width:\s*calc\(100%\s*-\s*\(var\(--mobile-gutter\)\s*\*\s*2\)\)/s, "mobile case visual should use the same safe viewport gutter as the hero content");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.ctaButton\s*{[^}]*width:\s*100%/s, "mobile CTA should use the section content width without double guttering");
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*{[\s\S]*\.medalBadge p\s*{[^}]*font-size:\s*clamp\(8\.6px,\s*2\.45vw,\s*9\.6px\)/s, "mobile badge text should scale up enough to remain readable");
});

test("case headings use a stylish readable sans-serif treatment", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /\.caseTitle\s*{[^}]*font-family:[^}]*Avenir Next[^}]*Hiragino Sans[^}]*sans-serif/s, "case heading should use a modern sans-serif stack");
  assert.match(css, /\.caseTitle\s*{[^}]*font-weight:\s*800/s, "case heading should be bold enough for the navy badge");
  assert.match(css, /\.caseTitle\s*{[^}]*width:\s*calc\(300 \* var\(--px\)\)/s, "case heading should scale from the compact title width");
  assert.match(css, /\.caseTitle\s*{[^}]*min-height:\s*calc\(42 \* var\(--px\)\)/s, "case heading should scale from the compact title badge height");
  assert.match(css, /\.caseTitle\s*{[^}]*font-size:\s*calc\(23 \* var\(--px\)\)/s, "case heading should scale from the compact readable font size");
  assert.doesNotMatch(css, /\.caseTitle\s*{[^}]*Georgia/s, "case heading should avoid the old serif treatment");
});

test("LP uses refined motion effects with reduced-motion support", () => {
  const css = readFileSync(cssPath, "utf8");

  for (const keyframe of ["heroReveal", "heroImageSettle", "sectionReveal", "ctaShimmer", "starDrift"]) {
    assert.match(css, new RegExp(`@keyframes\\s+${keyframe}`), `${keyframe} animation should be defined`);
  }

  assert.match(css, /\.heroTitle\s*{[^}]*animation:\s*heroReveal/s, "hero title should reveal smoothly");
  assert.match(css, /\.heroImagePanel img\s*{[^}]*animation:\s*heroImageSettle/s, "hero visual should settle in smoothly");
  assert.match(css, /\.ctaButton::before\s*{[^}]*animation:\s*ctaShimmer/s, "CTA should have a modern shimmer effect");
  assert.match(css, /\.finalCtaSection::before\s*{[^}]*animation:\s*starDrift/s, "final CTA background should have a subtle motion effect");
  assert.match(css, /@supports\s*\(animation-timeline:\s*view\(\)\)/, "case sections should use view-based reveal when supported");
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, "animations should respect reduced-motion preferences");
  assert.match(css, /animation:\s*none\s*!important/s, "reduced-motion mode should disable animations");
});

test("case revenue models use requested values and one shared framework", () => {
  assert.ok(existsSync(revenueModelPath), "revenue model generation config should exist");
  assert.ok(existsSync(revenueGeneratorPath), "revenue model asset generator should exist");
  const config = JSON.parse(readFileSync(revenueModelPath, "utf8"));

  assert.deepEqual(config.cases["case-1"].amounts, ["1万円/月", "10万円/月", "25万円/月"]);
  assert.deepEqual(config.cases["case-2"].amounts, ["5万円/月", "20万円/月", "35万円/月"]);
  assert.deepEqual(config.labels, ["(初案件)", "(3〜4ヶ月目)", "(5〜6ヶ月目)"]);
  assert.ok(config.framework, "both case images should be generated from the same revenue model framework");
  assert.equal(config.framework.preserveOriginalFrame, true, "baked-in revenue frames should be preserved instead of redrawn");
  assert.equal(Object.hasOwn(config.framework, "erase"), false, "generator should not use a visible background patch over the old frame");
  assert.ok(config.framework.label.width <= 0.32, "revenue model label should stay compact when redrawing is needed");
  assert.deepEqual(
    [
      config.framework.amountPositions[0],
      config.framework.arrowPositions[0],
      config.framework.amountPositions[1],
      config.framework.arrowPositions[1],
      config.framework.amountPositions[2]
    ],
    [0.14, 0.31, 0.48, 0.65, 0.82],
    "amounts and arrows should be evenly spaced"
  );
  assert.equal(Object.hasOwn(config.cases["case-1"], "framework"), false, "case 1 should not have a custom framework");
  assert.equal(Object.hasOwn(config.cases["case-2"], "framework"), false, "case 2 should not have a custom framework");
  assert.equal(Object.hasOwn(config.cases["case-1"], "panelRepair"), false, "case 1 should not need a panel repair");
  assert.equal(config.cases["case-2"].panelRepair?.redrawFrame, true, "case 2 should redraw the full revenue frame cleanly");
  assert.equal(
    Object.hasOwn(config.cases["case-2"].panelRepair ?? {}, "rightIntrusion"),
    false,
    "case 2 should not use a partial right-edge patch that creates a broken frame"
  );
});

test("CSS preserves the requested canvas width and clickable CTA layer", () => {
  assert.ok(existsSync(cssPath), "app/globals.css should exist");
  const css = readFileSync(cssPath, "utf8");

  for (const token of ["941px", "#0A2342", "#06182F", "#C8A14A", "#F3E0A3"]) {
    assert.match(css, new RegExp(token, "i"), `${token} should be present in CSS`);
  }

  assert.match(css, /\.ctaHitArea/, "CTA should have a clickable overlay while preserving the visual image");
});
