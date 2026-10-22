# Guijia Zhang — Academic Homepage

A single-page academic website with locally hosted fonts and no build step, framework, analytics, or external runtime.

## Structure

- `index.html`: biography, publications, research software, experience, education, honors, and contact.
- `singlepage.css`: responsive design, typography, focus states, reduced-motion and print rules.
- `singlepage.js`: optional progressive enhancement. The core content and navigation remain usable without JavaScript.
- `assets/`: fonts with licenses, CV, bibliography files, and retained research figures.
- Legacy page URLs redirect into the corresponding section of `index.html`; existing paper/project fragments remain usable.

## Design and interaction

The page pairs Source Serif 4 headings with Source Sans 3 reading text on a deep navy canvas (`#0A101B`). A large translucent orbital sundial is centered behind the viewport: an inclined dial, a raised two-face gnomon, and a differently tilted orbit give it spatial depth. Cyan and periwinkle light breathe through the scene. Glass surfaces are limited to the research map, acceptance notice, and featured software; publications and experience remain open reading sections. The symbol is decorative, not a visualization of research metrics or a claim of inevitable progress.

- The research map connects three research themes to eight papers and two software projects. Hover or keyboard focus highlights the associated connections; selecting a theme keeps its references marked. Work links navigate to real entries on this page. The map never silently filters the publication list.
- Publications can be filtered by status. Incoming links reveal papers hidden by a filter, and links to earlier work open its disclosure automatically. BibTeX is readable, downloadable, and explicitly copyable.
- Touch layouts, visible keyboard focus, reduced-motion preferences, no-JavaScript reading, and print styles are supported. Decorative SVG paths are excluded from the accessibility tree.
- Fonts are served locally. There are no trackers, AI runtime calls, or third-party scripts.

## Dynamic ornaments and performance

- The sundial stays centered while reading every section. Its primary trace, cast shadow, and aurora carrier share a 90-second rotation; a secondary orbit counter-rotates over 110 seconds. The light breathes over 14 seconds and the assembly subtly tilts over 16 seconds. No per-frame JavaScript is used for the background.
- Ten interaction-triggered SVG beam paths and three staggered topic-node halos follow the actual research-map geometry. The map and featured software pause their ornaments when offscreen.
- The research map, acceptance notice, and featured software have thin travelling rim highlights and restrained breathing accents. The acceptance dot is decorative, not a live-computation indicator.
- A visible Pause/Resume motion control remembers the visitor's preference when storage is available. It stops background, node, and card motion without disabling content controls. System reduced-motion preferences take priority, including changes during a visit; hidden tabs pause animation.
- Mobile retains a smaller centered sundial and its breathing light. No-JavaScript and reduced-motion views keep a static composition. External action arrows and navigation/filter underlines use small eased transitions without moving paper titles.

The superseded `style.css`, `editorial.css`, and `site.js` have been removed; the complete earlier implementation is retained in the separate pre-optimization backup archive.

## Preview

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. GitHub Pages serves the root of `main` at https://123zgj123.github.io/; these static files require no build step.

## Content maintenance

Keep paper titles, roles, statuses, summaries, public links, and bibliography files synchronized. Describe empirical results within their tested scope. The current eight main papers remain visible by default; older work may be disclosed within the same page.

The owner supplied the current publication statuses: ECA and STARS accepted to Findings of EMNLP 2026; six recent manuscripts Under Review without target venues. The three newest manuscripts are first-author work per the owner's confirmation. World-model research is exploratory; forthcoming doctoral enrollment is not displayed.

Earlier publication records and experience were carried over from the existing site. The unverified inherited “CVPR Findings” label for Spatial Causal Prediction in Video is intentionally omitted. Confirm missing publication metadata before adding it. The bundled CV is the available October 19, 2026 English PDF.

## Implementation provenance

Gemini-4-argon authored the single-page design and frontend implementation through the owner-specified API, with explicit approval to review the site's source and screenshots. Codex handled source-content auditing, integration, optical/depth refinements, and browser verification. Credentials and API responses are excluded from this repository and the website makes no AI API calls.

## Verification

On October 23, 2026, 354/354 checks passed in local Chrome with no script or local resource errors. Coverage includes 320–1440 px layouts, unchanged paper content, filters, map interactions, stable selection geometry, touch and keyboard controls, citations, legacy URLs, blocked-script fallback, motion pause/resume, system reduced motion, hidden tabs, and desktop/mobile animation samples at 3 and 8 seconds. Two five-second headless frame samples (1440px and 390px) recorded approximately 60fps with no long tasks; this is not a benchmark of every visitor's device. Tests and visual captures are kept outside the published repository. Browser checks do not imply full accessibility or cross-browser certification.
