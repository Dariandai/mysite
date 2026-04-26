# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro 5 portfolio website deployed to Cloudflare Pages. Features a dark minimalist design with stacking-cards scroll system (GSAP ScrollTrigger), bilingual support (Chinese/English), and responsive layouts.

## Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build to ./dist/
npm run preview  # Preview build locally
npm run check    # TypeScript type checking
npm run lint     # ESLint checking
npm run format   # Format code with Prettier
```

## Architecture

### Stacking Cards Scroll System (v3)

Desktop uses `position: fixed` + GSAP `translateY` instead of `position: sticky`. This allows section transitions while keeping content scrollable within each section.

**Key files:**
- `src/scripts/stacking-cards.js` — Core scroll logic
- `src/layouts/BaseLayout.astro` — Navbar, mobile menu, back button
- `src/pages/index.astro` — Homepage with 5 sections

**How it works:**
- Sections are `position: fixed` with `transform: translateY(100%)` stacking on top of each other
- `body overflow: hidden` — window scroll is disabled
- `.section-scroll-wrapper` (`position: absolute; inset: 0; overflow-y: auto`) handles content scrolling natively
- Touch: `touchstart`/`touchend` velocity detection for swipe gestures
- Wheel: forwarded to content wrapper, section change triggers at boundaries

### Design System

Dark theme with CSS variables in `src/styles/global.css`:
- `--bg-color: #050505`, `--card-bg: #0f0f0f`
- `--text-main: #ffffff`, `--text-muted: #666666`
- Fonts: Syne (display), DM Sans (body), Space Mono (mono)
- Easing: `var(--ease-out-expo)`, `var(--ease-spring)`

### Page Routes

- `/` — Homepage with stacking sections (Home, About, Blog, Portfolio, Share)
- `/about/` — Fishbone timeline + Skills grid
- `/blog/` — Article list with normal scroll
- `/blog/[slug]/` — Dynamic blog post pages
- `/portfolio/` — Project cards grid
- `/portfolio/project-alpha/` and `/portfolio/system-ui/` — Individual project pages
- `/share/` — Tools & resources grid

### Content

Blog posts in `src/content/posts/*.md` using Astro content collections with frontmatter for title, date, description.

## Vite HMR on Windows

On Windows, Vite's chokidar file watcher may fail to detect changes to `src/styles/global.css`. **Fix:** Modify a comment in `BaseLayout.astro` inside `<style is:global>` (e.g., change `/* v3 */` to `/* v3.1 */`) to force recompilation.

## Deployment

Built output deploys to Cloudflare Pages. Wrangler CLI for manual deploy:
```bash
npx wrangler pages deploy dist
```
