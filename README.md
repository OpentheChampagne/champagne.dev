# Champagne.dev

Felipe Castillo’s personal site: Astro static pages, Markdown notes, CSS UI vignettes, and a Three.js champagne spinner.

## Develop and build

Requires Node 22.12+.

```sh
npm install
npm run dev
npm run check
npm run preview
```

`check` runs Astro’s diagnostics and a production build. Cloudflare Pages should run `npm run build` and publish `dist`. No server adapter is needed. The custom 404 page prevents unknown routes from becoming a single-page-app fallback.

## Write a post

Add `src/content/blog/your-slug.md`:

```md
---
title: "Your title"
description: "A short description for the notes and search results."
date: 2026-10-06
tags: [design, engineering]
draft: true
---

Your post, in Markdown.
```

Set `draft: false` to publish. Drafts and future-dated entries are excluded from all routes, listings, RSS, and the sitemap. Dates use UTC and are checked at build time, so a future-dated note goes live only after the next build on or after its date: trigger a rebuild (or a scheduled Cloudflare Pages deploy hook) that day. The file name becomes `/notes/your-slug`; use flat file names. Images in `public` use root-relative URLs (for example `/posts/images/your-image.png` for `public/posts/images/your-image.png`). The original Lorem Ipsum post is retained as a draft. There are no fabricated published entries.

## Motion and rendering

- Three feature illustrations use HTML and CSS only, with 5–6 second loops and long reading holds. Opacity has separate ease keyframes; transforms use spring curves with cubic-bezier fallbacks.
- Card entry animates the outer wrapper’s transform on a native view timeline. Unsupported browsers show the static cards. Hover lifts the inner card, so the transforms do not compete.
- One delegated pointermove listener accepts mouse/pen input and writes both light coordinates once per animation frame.
- Reduced motion disables CSS animation, hover movement, pointer light, smooth scrolling, and automatic 3D rotation. The model renders a static frame.
- Three.js loads only as the hero approaches the viewport. Rendering uses the device resolution (capped at 2x) and the display refresh rate; camera rotation is time-based at 3 radians/second (the original 0.05 radians/frame at 60Hz), and the loop stops offscreen and when the tab is hidden. Dragging rotates the model; zoom and pan are disabled. WebGL/model failure leaves a text fallback.
- The original 4.3MB GLB remains unchanged. Compare frame time and power use on real devices before claiming a runtime performance gain from the engine switch.

The original cream-and-black portfolio layout, Instrument Serif typography, original copy, company logos, and rose video are preserved. The bento section supports system dark mode. No React, Babylon, Framer Motion, or animation library is shipped.

## License

The code is licensed under MIT. See LICENSE.

That license doesn't cover the site's content: the writing, photos and other images, and the 3D model. Those are © Felipe Castillo, all rights reserved. ADWEEK and Planit names, logos and screenshots belong to their owners. The fonts are under the SIL Open Font License (`public/fonts/OFL*.txt`).

The Three.js spinner uses the original `sanGiuseppeBridge.env` environment. Its RGBD cube faces are decoded in a shader and prefiltered for Three.js reflections; no Babylon runtime is loaded. The rose has scroll scrubbing, with automatic motion disabled under reduced motion.

ADWEEK uses the current official homepage SVG wordmark in white. The public writing section is Notes (`/notes`); legacy `/blog` URLs redirect. Decorative media controls are omitted; reduced-motion and offscreen pausing remain.
