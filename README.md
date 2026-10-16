# Expertz Barber Shop — website concept

A premium, responsive, frontend-only presentation. Built from the initially empty repository using Vite, vanilla JavaScript, locally hosted Manrope / Barlow Condensed fonts, and tree-shaken Lucide icons. No backend, database, analytics, customer-data storage, or automatic scheduling.

## Run locally

```sh
npm install
npm run dev
npm run build
npm run preview
npm test
```

The development server binds to `0.0.0.0` and allows Arena's `.e2b.app` preview hosts. This is a workspace preview, not a production deployment. Search indexing is intentionally disabled in `index.html`.

## Update the concept

- `src/config.js`: phone, WhatsApp, address, hours, and social placeholder label.
- `index.html`: proposed wordmark, brand copy, service menu, gallery, and other editable content.
- `src/style.css`: responsive design and design tokens.
- `src/main.js`: mobile menu, active navigation, native accessible dialogs, gallery enlargement, and enquiry flow.
- `public/images/`: self-hosted stock imagery. Replace with approved business photography.

### WhatsApp safety

`WHATSAPP_NUMBER_TO_CONFIRM` is deliberately not a phone number. The WhatsApp link is absent until configuration contains 8–15 international-format digits with no leading zero, `+`, spaces, or punctuation. Only insert the actual owner-approved business number. A valid number produces `https://wa.me/NUMBER?text=ENCODED_MESSAGE`. This format check cannot verify ownership or whether WhatsApp is active.

Appointment buttons open an enquiry composer. Visitors can choose a sample service, edit the message, or copy it. No data is submitted or stored. Once configured, the composer offers an explicit link to WhatsApp. Availability and prices still need to be agreed directly with the business.

## Owner approval checklist

- Actual logo / approval of proposed wordmark
- Brand introduction and positioning
- Actual services, availability, and prices (no prices invented)
- Business-owned photographs and permissions
- Phone and WhatsApp number
- Physical address (no unverified map is embedded)
- Opening hours
- Social profiles (currently clearly labelled, not dead links)

Confirm the details before replacing placeholder labels. Add actual social anchors only after the profile URLs are supplied. Review and remove concept notices and `noindex` only when a real launch is approved.

## Photography

The following Pexels stock images are used under the [Pexels licence](https://www.pexels.com/license/). They are illustrative only, not representations of the shop, team, or its work. The page explicitly identifies this. Local, compressed JPEGs avoid third-party image requests and provide consistent crops.

| Local file           | Pexels photo                           |
| -------------------- | -------------------------------------- |
| `barber-at-work.jpg` | https://www.pexels.com/photo/3998407/  |
| `beard-detail.jpg`   | https://www.pexels.com/photo/3998421/  |
| `classic-fade.jpg`   | https://www.pexels.com/photo/7781848/  |
| `textured-cut.jpg`   | https://www.pexels.com/photo/27467943/ |
| `scissor-cut.jpg`    | https://www.pexels.com/photo/16098668/ |

## Quality checks

- Production build and Node unit tests pass.
- Headless Chromium tested at 320, 390, 768, 1024, and 1440px: no horizontal document overflow; all images loaded.
- Mobile menu opening, section navigation, closing on link activation, and Escape handling tested.
- All visible appointment buttons, service selection, message-copy feedback, gallery dialogs, demo information dialog, and internal link destinations tested.
- WhatsApp placeholder blocked; URL structure and encoded message round-trip covered by unit tests using a synthetic test-only number.
- No browser runtime errors observed. Desktop and mobile screenshots reviewed for layout and cropping.
- Native modal dialogs provide focus containment, Escape dismissal, and focus restoration; reduced-motion preferences respected.

No domain purchased, production hosting configured, or paid service used.

### Final client-demo review

Targeted corrections, without redesigning the concept:

- Clarified the proposed identity in the hero, labelled the About photograph locally as stock, and changed the contact CTA to “Prepare a WhatsApp enquiry” so it does not suggest a connected number.
- Increased service-number contrast and enlarged modal close targets to 44px.
- Made the mobile menu scroll within short/landscape viewports and restored focus to its visible toggle when hiding a focused menu item.
- Cleared stale copy-success feedback when editing a message, prevented copying an empty draft, and improved the general enquiry wording.
- Used explicit gallery title elements rather than depending on HTML text-node ordering.

The repeatable browser review is `tests/client-review.cjs`. It requires optional external `playwright` and `@axe-core/playwright` tooling and an installed Chromium browser; these are intentionally not added to the app's dependencies. With those packages available to Node, run `node tests/client-review.cjs` against `npm run dev`. Set `CLIENT_REVIEW_URL` to test a production preview instead; `CHROMIUM_PATH` optionally selects an existing browser executable.

The suite passed against both development and production preview builds at 1440×900, 1024×900, 768×1024, 390×844, 320×640, and 844×390. It covers automated WCAG A/AA checks, document overflow, loaded images, mobile navigation, modal focus restoration, enquiry states, actual clipboard contents and denied-permission fallback, all CTAs, gallery titles and dialogs, internal links, reduced motion, and runtime errors. No automated accessibility violations were detected in the tested states; this is not a certification or a substitute for testing with real assistive technology. Mobile and desktop screenshots were also reviewed. Three unit tests and the production build pass.

## GitHub Pages deployment

Keep **Settings → Pages → Build and deployment → Source** set to **GitHub Actions**.
The existing `.github/workflows/deploy.yml` builds with Vite and uploads only `dist/`
using `upload-pages-artifact` / `deploy-pages`. Do not deploy the repository root or
run a parallel branch/Jekyll deployment: source `index.html` deliberately contains
`/src/main.js`, which only the Vite build transforms into compiled JS and CSS.
The `base: "/Expertz-Barberz/"` setting also rewrites public image and favicon URLs;
the source URLs do not need to be manually prefixed.

The workflow now checks the Pages source, verifies the built artifact before upload,
and checks the actual deployed HTML and asset HTTP responses after deployment.
Run the same checks manually:

```sh
npm ci
npm test
npm run build
npm run test:production
node scripts/verify-site.mjs https://arabninja-hub.github.io/Expertz-Barberz/
```

The verifier requires compiled JS and CSS, subpath-safe URLs, all five photographs,
the favicon and CSS font files. Remote checks require HTTP 200 and appropriate
HTML/JS/CSS/image content types, with retries for Pages propagation. A green
upload/deploy alone is not proof the correct site is live.

### Investigation (2026-10-16)

- Vite run `38965140193` uploaded a 460,177-byte Pages artifact and deployed at
  20:51:02 UTC. Its upload path was already `dist`.
- A competing generated Jekyll run `38965140445` uploaded a different 311,058-byte
  artifact and deployed at 20:51:06 UTC, after the Vite deployment. Its jobs show
  “Build with Jekyll”, not a Vite build. This is consistent with the reported raw
  `/src/main.js`, root favicon and image 404s.
- The Pages API currently reports `build_type: workflow` (GitHub Actions); retain
  that setting and deploy the Vite workflow again to replace the Jekyll output.
- Local `dist/index.html` references `/Expertz-Barberz/assets/index-*.js` and `.css`,
  `/Expertz-Barberz/favicon.svg` and `/Expertz-Barberz/images/*.jpg`; all exist.
- This workspace cannot fetch the `github.io` host or artifact blob-storage host,
  so deployed artifact contents and live HTML could not be independently read.
  Attempts to rerun/dispatch the Vite workflow were also rejected by GitHub
  (rerun refused; dispatch HTTP 403). No live-site fix is claimed. After these
  changes reach `main`, the workflow's remote verification must pass; alternatively
  an authorized maintainer can run the existing Vite workflow from Actions now.
