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
