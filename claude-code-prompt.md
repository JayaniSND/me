# Claude Code prompt

Paste this into Claude Code from inside the site folder.

---

You have `index.html`, `styles.css`, `script.js` in this folder. Static site, no build
step, deploys to GitHub Pages. Keep it that way: no framework, no bundler, no npm
dependencies in the shipped site.

I'm adding three files to this folder: `Resume26.pdf`, `Geisel.jpg`, `Jayani.JPG`.
Both photos are of me. Do the following.

## 1. Resume
Point every "Resume" link at `Resume26.pdf`. Open in a new tab. There are links in the
intro section and in the closing contact section.

## 2. Polaroid photo
Put `Jayani.JPG` in the polaroid frame in the intro section. Set the `src` and remove the
`onerror` placeholder fallback. Add `loading="lazy"` and a real `alt`. If the file is over
about 400KB, resize it to roughly 900px on the long edge and save an optimized copy rather
than shipping the original.

## 3. Geisel background
Use `Geisel.jpg` as a background image, but keep the text readable. Do not just drop it
behind the whole page at full strength. Pick one:
- fixed, heavily desaturated and dimmed, behind the closing contact panel only, or
- a subtle full-page background at low opacity with the existing `--bg` color layered over it

Whichever you choose, all body text must stay at 4.5:1 contrast in both light and dark
mode. Test both themes before you call it done. Optimize the file the same way as above.

## 4. Cutout
Make a transparent-background PNG cutout of me from `Jayani.JPG`. Use `rembg` locally
(`pip install rembg`, `rembg i Jayani.JPG cutout.png`) or any equivalent. If subject
isolation comes out rough around hair or edges, tell me instead of shipping a bad mask.
Save as `cutout.png`.

Place it somewhere that earns it, not as decoration. Good candidate: the closing contact
section, sized modestly and anchored to one side, or beside the statement line. It should
never overlap text or push the layout around on mobile. Hide it under 700px if it crowds
things.

## 5. Grid and spacing
Audit spacing across the whole page. Section rhythm should be consistent, cards in a row
should be equal height, and every list column (dates, skill labels, fact labels) should
align to the same measurements. Fix anything that looks off by a few pixels. Check 1440px,
1024px, 768px, and 390px widths.

## 6. Animation
Add slow, restrained landing animations. Content should settle in, not fly around.
- staggered fade and small upward translate on first paint for the intro block
- keep the existing scroll reveals, but make sure nothing pops
- ease-out curves, 500-800ms, nothing bouncy
Everything must respect `prefers-reduced-motion: reduce`. There's already a media query
for it at the bottom of `styles.css`; extend it rather than adding a second one.

## 7. Polish
Reference https://www.worldlabs.ai/about for restraint: generous whitespace, calm
typography, quiet color. Keep the existing lavender palette and Instrument Serif headings.
Don't add new fonts or new accent colors.

## Constraints
- Total page weight under 1MB including images.
- No new runtime dependencies. Python image tools are fine as one-time local steps.
- Don't put my email address in the HTML. The reveal-on-click logic in `script.js` stays.
- Keep the EDIT comments in `index.html` accurate if you move things.

When done, list what changed, the final page weight, and anything you'd flag.
