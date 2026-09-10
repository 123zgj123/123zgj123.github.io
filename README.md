# Guijia Zhang — Academic Homepage

A static academic website, built with HTML, CSS, and a small progressively enhanced JavaScript file. No build step, framework, analytics, or third-party runtime is required.

## Pages

- `index.html`: introduction, three selected papers, research software, and news.
- `publications.html`: complete publication record, conference/preprint filters, expandable descriptions, and downloadable BibTeX citations.
- `experience.html`: research and industry experience, followed by education.
- `projects.html`: engineering projects organized around the problem and implementation.
- `awards.html`: honors and additional training.

Shared styles live in `style.css`; navigation and citation interactions live in `site.js`. The five pages contain their own semantic navigation and footer, so they remain readable without JavaScript. Keep these shared sections in sync when changing links.

## Preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. GitHub Pages serves the same files without a build step. `.nojekyll` is intentional.

## Content updates

- Add papers to `publications.html` under the appropriate `data-category` section. The filters count entries automatically.
- Keep the selected papers on `index.html` synchronized with the full publication list.
- Store citations in `assets/citations/` and update both the downloadable file and the visible citation. Current BibTeX entries cite the public arXiv versions; they do not invent conference pagination or proceedings identifiers.
- Add recent updates at the top of the homepage news list. Older updates remain in the native “Earlier notes” disclosure.
- Replace `assets/cv.pdf` when the CV is updated. It is preserved unchanged in this redesign.
- Update the visible footer date when editing content.
- Research figures in `assets/eca.svg`, `assets/stars.svg`, and `assets/gui.svg` are explanatory schematics, not reproductions of experimental results. Their text, arrows, and accessible descriptions can be edited directly.

## Typography and accessibility

Source Serif 4 and Source Sans 3 are hosted locally under `assets/fonts/`; their SIL Open Font Licenses are included alongside them. The Latin subsets use system-font fallbacks for unsupported characters. Main colors and spacing are defined at the top of `style.css`.

The site includes keyboard focus styles, a skip link, current-page navigation, an accessible mobile menu, reduced-motion support, print styles, and no-JavaScript fallbacks. Citation copying falls back to selecting the text when clipboard access is unavailable.

## Editorial notes

Public author lists for ECA, STARS, and the GUI-agents paper were checked against their arXiv records on 2026-09-10. The GUI-agents description reflects the updated preprint. The public STARS code link was added from the paper.

Existing conference acceptance labels and records without public links were preserved from this repository. These are not newly verified venue claims. In particular, check the exact venue name for “Spatial Causal Prediction in Video” before the next content update. Some older records currently describe contribution roles instead of a full author list; add complete citations when available.

The bundled CV still contains older submission/planning language, while the homepage reports ECA and STARS as accepted to EMNLP 2026 Findings. Reconcile those dates and statuses in the next CV revision. The exchange-student end date remains marked “expected” as in the original record.
