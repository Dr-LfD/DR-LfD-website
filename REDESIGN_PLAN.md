# DR-LfD Project Page — Redesign Plan

**Repo:** `website/academic-project-template` (Vite + React + UIKit 3, YAML-driven)
**Remote:** `Dr-LfD/DR-LfD-website` → GitHub Pages `/DR-LfD-website/`
**Paper source of truth:** `~/yzchen_ws/LfD-TAMP-TRO-response`
**Decisions:** authors stay anonymous · videos compressed + lazy-loaded (self-host) · diagrams hybrid (reuse clean paper figs, rebuild the 1–2 key ones)

---

## Context — why this change

The page today is a wall of unlabeled video sliders. A new reader cannot answer "what is this method, why does it work, does it beat baselines" without reading the paper. Three concrete problems:

1. **Not pretty** — stock UIKit template, "Anonymous / thispersondoesnotexist" hero, no nav, no visual hierarchy, no method/results sections, broken `<iframe>` hero video (`video.jsx` points an iframe at a local `.mp4`).
2. **Video loads slowly** — `public/` is **346 MB**; single clips up to **49 MB** (`ppt-pics/sup-vid.mp4`), 25 MB, 23 MB. `preload="metadata"` on ~30 tags, **no posters, no lazy-load** → the browser fetches metadata for every clip on load.
3. **Not deliverable** — no TL;DR, no pipeline diagram, no "why it works", **no statistics at all** (the paper's strongest asset), no baseline comparison.

Target quality bar: `shengxu.net/AgentChord` and `diffusion-ccsp.github.io` — sticky nav, tagline, stat callouts, one-concept-one-figure, captioned media, method-before-demos ordering.

---

## How the site renders (so edits land in the right place)

- `src/pages/index.jsx` assembles: `Header → Overview → Video → SpeakerDeck → Body`. `Citation/Projects/Footer` exist but are commented out.
- **All prose + media live in `template.yaml`.** `body.jsx` runs each `body[].text` through `marked.parse()` then `dangerouslySetInnerHTML`, so **raw HTML (including `<video>`, `uk-slider`, tables) inside the YAML renders as-is.** → most content work is editing `template.yaml`, not JSX.
- `body.jsx` already: sets `data-playback-rate`, and has an **IntersectionObserver that pauses off-screen slider videos** (`src/components/body.jsx`). We extend this observer for lazy-loading rather than adding a new one.
- Theme via `template.yaml: theme:` → `src/js/styles.js` picks `theme.scss | classic-theme.scss | dark-theme.scss`. Fonts/accent live in those SCSS files.
- `vite.config.js` base = `/DR-LfD-website/` in prod; `public/` served at root. Dev: `npm run dev` (port 8080). Build: `npm run build` (+ react-snap prerender).

---

## Workstream A — Video performance (biggest UX win)

Goal: first paint with **zero video bytes**; each clip loads only when scrolled near. Target `public/` from 346 MB → under ~60 MB.

### A1. Re-encode every clip (ffmpeg)
Create `scripts/compress_videos.sh`. For each `*.mp4` under `public/` write to `public_optim/` preserving paths:

```bash
# H.264 web-tuned: cap height at 720p, CRF 28, faststart (moov atom up front for progressive play)
ffmpeg -i "$in" -vf "scale=-2:'min(720,ih)'" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 28 -preset slow \
  -movflags +faststart -an "$out.mp4"

# Optional VP9/WebM sibling for ~20-30% more savings (add <source> for both)
ffmpeg -i "$in" -vf "scale=-2:'min(720,ih)'" -c:v libvpx-vp9 -crf 34 -b:v 0 -an "$out.webm"
```

Notes:
- **`-an` drops audio** — every clip is `muted`; audio is dead weight.
- Clips already sped via `data-playback-rate="4|6"` can be **baked** with `setpts=PTS/4` and the attribute removed → shorter files, fewer decoded frames. Do this only for the fixed-rate demo clips, not the narrated `sup-vid`.
- The 49 MB `sup-vid.mp4` (main supplementary reel) is the one exception: even compressed it's heavy for a hero. Keep it, but it must be **click-to-load** (poster + `preload="none"`), never autoloaded.
- Validate each output plays and check total: `du -sh public_optim`. Swap `public_optim` → `public` only after spot-checking 3–4 clips.

### A2. Poster frames (kills the blank-canvas look + enables lazy-load)
```bash
# 1s in, scaled to match, ~30-60 KB JPEG
ffmpeg -ss 00:00:01 -i "$in" -frames:v 1 -vf "scale=-2:'min(720,ih)'" -q:v 4 "$poster.jpg"
```
Every `<video>` gets `poster="…jpg"`.

### A3. Lazy-load — extend the existing observer in `body.jsx`
Author videos in `template.yaml` as:
```html
<video data-src="aloha2-vid/unreach1.mp4" poster="posters/unreach1.jpg"
       preload="none" muted loop controls controlsList="nodownload"
       playsinline style="cursor:pointer"
       onclick="this.paused?this.play():this.pause()"></video>
```
In `body.jsx`, in the IntersectionObserver callback: when a `<video[data-src]>` enters (rootMargin `200px` so it's ready just before view), set `video.src = video.dataset.src` once, then `removeAttribute('data-src')`. Off-screen clips never fetch a byte. This reuses the observer already present for slider pause/reset — no new dependency.

### A4. Hero video (`src/components/video.jsx`) — fix the broken iframe
Replace the `<iframe src={mp4}>` with a native `<video>` using poster + `preload="none"` + click-to-play, pointing at the compressed `sup-vid`. (Or drop the top-level hero video entirely and let the new teaser figure carry the hero — see C1.)

**Acceptance:** DevTools Network on cold load shows **no `.mp4` requests** until scroll; each clip ≤ ~3 MB except `sup-vid`; Lighthouse "Largest Contentful Paint" no longer a video.

---

## Workstream B — Content & structure (get-the-gist-in-60-seconds)

Rewrite `template.yaml` into this section order (mirrors AgentChord/CCSP). Each is a `body[]` entry (title + markdown/HTML).

1. **Hero / Header** (`header.jsx` via YAML top fields)
   - `journal:` badge → e.g. `"Submitted to IEEE T-RO"` (renders a badge).
   - **Tagline** under the title (one line): *"Decompose demonstrations into skills, let TAMP put them back together."*
   - Resource buttons already wired: `paper`, `code`, plus add `video` (anchor to demos). Keep authors anonymous.

2. **TL;DR / Contributions** (new first `body` section) — the quasi-abstract. Four bolded one-liners straight from the paper's contribution list:
   - **TAMP-gated skill abstraction** — atomic skills mined from demos, recomposed for combinatorial goals.
   - **Equivariant object-centric primitives** — SO(3)-equivariant diffusion → spatial generalization from minimal data.
   - **Policy↔TAMP interface** — initiation/termination/constraints of visuomotor policies modeled in PDDLStream form.
   - **Data scales with skill *types*, not sequence length** — the core efficiency claim.

3. **Method — pipeline** (see C1 diagram). Narrative + 5-step numbered list:
   `Demonstration → VLM-assisted contact-aware decomposition → skill repertoire (equivariant primitives · visuomotor policies+keyposes · predefined TAMP moves) → TAMP reorganization (auto PDDL schema, reachability/safety streams) → online perceive–plan–act–verify`.

4. **Why it works** (short, the reader's payoff) — 3 bullets:
   - *Combinatorial → linear:* TAMP owns sequencing, so demos scale with #skill-types not #sequences.
   - *In-distribution guarantee:* keypose predictors place the arm where the policy's observations stay in-distribution.
   - *Constraints as first-class:* reachability maps + Minimum-Distance-Field safety let the planner insert regrasps / obstacle-removal that pure IL can't.

5. **Results** (see C2/C3) — stat callouts → comparison tables → Wilson-CI plots, with one honest-tradeoff line per weak cell (Cup-sleeve Leaky).

6. **Video demos** — the current galleries, but **each slider gets a one-line caption** (task + what to look for) and lives *after* method/results. Group: Constraint handling (unreachable/unsafe) · Unseen setups (handoff/screwdriver) · Skill composition (3-tapes, cup-sponge-screwdriver) · Simulation (LIBERO). Keep the `sup-vid` reel here as click-to-play.

7. **Citation** — un-comment `Citation` in `index.jsx`, add `bibtex:` to YAML, one-click copy (already implemented in `citation.jsx`).

---

## Workstream C — Multimedia illustrations (how to build each)

### C1. Hero pipeline diagram — **rebuild web-native** (hybrid: this is the one to redo)
- **Source:** `figures/overall-diagram.pdf` + `figures/tro-teaser.pdf` (dense, paper-styled, tiny fonts — poor on web).
- **Build:** use the **drawio-skill** (or Excalidraw) to make a clean left-to-right flow: `Demos ▸ Decompose (contact graphs) ▸ Repertoire (3 skill icons) ▸ TAMP ▸ Robot execution`. Big labels, the paper's color semantics, ≤6 boxes.
- **Export:** SVG (crisp at any zoom) → `public/paper-figures/pipeline.svg`; PNG @2x fallback. Reference as the `teaser:` field so it's the hero image.
- **Caption** decodes the colors (à la AgentChord teaser).

### C2. Stat callout cards — **build in HTML/CSS** (no image)
Four big numbers at the top of Results, from the extracted tables:
- **88–100%** peg-in-hole success (vs 2–54% ACT/DP) — *"7× the stronger baseline"*
- **70–90%** DexMimicGen with **100 demos** (beats DP/SDP at **1000 demos**)
- **55–70%** success under *unreachable/unsafe* where IL scores **0%**
- **98%** LIBERO Spatial/Object (closed-loop)
Render as a UIKit card grid in the Results `body.text`. Numbers are in `MULTIMEDIA_ASSETS.md` (below) so they're auditable.

### C3. Comparison tables + Wilson-CI plots — **reuse + regenerate**
- **Tables:** author as Markdown tables in YAML (body.jsx already styles them via a custom `marked` table renderer). Put **DR-LfD as the last, bolded row.** Tables to include: `tab:sim_ood` (peg-in-hole), `tab:real_ood` (real-world ID/OOD/Leaky), `tab:sim_long` (constraints), `tab:libero_results`, `tab:dexmimicgen`.
- **Wilson-CI figures:** regenerate from the paper's own script `~/LfD-TAMP-TRO-response/figures/plot_wilson_ci.py` but **export SVG with larger fonts** for web → `public/paper-figures/wilson_real.svg`, `wilson_sim.svg`. These visualize uncertainty at n=20 / n=50.

### C4. Reused paper figures (hybrid: keep as-is, just convert)
Convert these already-clean PDFs to web PNG (≥150 dpi) and caption them one-concept-each:
- `vlm-grounding.pdf` → how contact-based decomposition is grounded by the VLM.
- `skillequivNet.pdf` / `primitive_with_pc.pdf` → the SO(3)-equivariant primitive network.
- `tro-unsafe-unreachable.pdf` → reachability map + Minimum-Distance-Field.
Convert: `pdftoppm -png -r 200 fig.pdf out` (or `magick -density 200 fig.pdf fig.png`), trim whitespace with `magick fig.png -trim +repage fig.png`, store in `public/paper-figures/`.

### C5. Optional — decomposition micro-animation
A 3–5 s GIF/WebM showing one demo segmenting into colored contact phases (from `sup-vid` or a rebuilt clip). Nice-to-have; skip if time-boxed.

---

## Workstream D — Visual polish (`*.scss`, components)

- Pick theme: **`default`** (Poppins/Source-Sans, pink accent) is fine; align accent to the paper's blue (`#4a86e8`) in `theme.scss` for brand consistency. Optionally add a dark-mode toggle (`toggleTheme` already stubbed in `styles.js`).
- **Sticky anchor nav** (Overview · Method · Results · Demos · Paper) — small new component or a `uk-navbar uk-sticky`; anchors to section ids. This is the single biggest "feels designed" win.
- Consistent section spacing, max-width, larger figure captions. Reuse UIKit utilities already in the codebase.

---

## Execution order

1. **A (video)** first — independent, unblocks a fast dev loop and is the clearest measurable win.
2. **C1 + C4** diagrams (assets ready before wiring content).
3. **B** content rewrite of `template.yaml` (consumes C assets), + **C2/C3** tables/callouts.
4. **D** polish + sticky nav.
5. Build, prerender, verify, deploy.

## Verification (end-to-end)

- `npm run dev` → cold-load Network tab: **0 video requests before scroll**; posters visible instantly.
- `npm run build && npm run preview` → check base-path assets resolve, react-snap prerender OK.
- Lighthouse: Performance ≥ 90, LCP not a video.
- Manual read-through: can a new reader state the method + see it beats baselines **without opening the PDF**? (the acceptance test for issue #3).
- `du -sh public` under ~60 MB.
- Deploy to `Dr-LfD/DR-LfD-website` gh-pages; confirm live.

## Companion artifact
`MULTIMEDIA_ASSETS.md` — the full extracted method narrative + every table's exact numbers (peg-in-hole, real-world, constraints, LIBERO, DexMimicGen, clean-vs-cluttered ablation) as the single source of truth for the callouts/tables, so content work never re-reads the LaTeX.
