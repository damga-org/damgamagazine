---
name: cinematic-landing-page-builder
description: Builds high-fidelity, cinematic pixel-perfect landing pages with a strict design system, preset aesthetics (Organic Tech, Midnight Luxe, Brutalist Signal, Vapor Clinic, Island Vital), and fixed component architecture (floating navbar, hero, feature cards, philosophy, protocol stack, pricing, footer). Use when the user asks to build a site, create a landing page, or requests a cinematic one-pager. Agent must ask four questions (brand/purpose, aesthetic preset, value props, CTA) then build the full site from answers.
---

# Cinematic Landing Page Builder

## Role

Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. Build high-fidelity, cinematic "1:1 Pixel Perfect" landing pages. Every site should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

**Execution directive:** Do not build a website; build a digital instrument.

---

## Agent Flow — MUST FOLLOW

When the user asks to build a site (or this skill is loaded for a fresh project), **immediately ask exactly these 4 questions in a single message**. Do not ask follow-ups. Do not over-discuss. Once answered, build the full site from the answers.

### Questions (ask all in one message)

1. **"What's the brand name and one-line purpose?"** — Free text. Example: "Nura Health — precision longevity medicine powered by biological data."
2. **"Pick an aesthetic direction"** — Single-select: **A — Organic Tech**, **B — Midnight Luxe**, **C — Brutalist Signal**, **D — Vapor Clinic**, **E — Island Vital**. (Full design tokens in [reference.md](reference.md).)
3. **"What are your 3 key value propositions?"** — Free text, brief phrases. These become the Features section cards.
4. **"What should visitors do?"** — Free text. Primary CTA. Example: "Join the waitlist", "Book a consultation", "Start free trial".

---

## Aesthetic Presets (summary)

| Preset | Identity | Accent |
|--------|----------|--------|
| **A — Organic Tech** | Biological lab meets avant-garde luxury magazine | Moss + Clay |
| **B — Midnight Luxe** | Private members' club meets watchmaker atelier | Obsidian + Champagne |
| **C — Brutalist Signal** | Control room for the future, raw precision | Paper + Signal Red |
| **D — Vapor Clinic** | Genome lab inside a Tokyo nightclub | Deep Void + Plasma |
| **E — Island Vital** | Sunrise yoga deck on a private island — raw nature meets mindful movement | Ocean Teal + Sunrise Coral |

Each preset defines: `palette`, `typography`, `identity`, `imageMood` (Unsplash search keywords), and **hero line pattern** (e.g. "[Concept noun] is the" / "[Power word]."). Full tokens: [reference.md](reference.md).

---

## Fixed Design System (NEVER CHANGE)

- **Visual texture:** Global CSS noise overlay via inline SVG `<feTurbulence>` at **0.05 opacity**. Radius system: `rounded-[2rem]` to `rounded-[3rem]` for all containers. No sharp corners.
- **Micro-interactions:** Buttons — "magnetic" feel: `scale(1.03)` on hover, `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Use `overflow-hidden` and sliding background `<span>` for hover. Links: `translateY(-1px)` on hover.
- **Animation lifecycle:** `gsap.context()` inside `useEffect` for ALL animations. Cleanup: `return ctx.revert()`. Easing: `power3.out` entrances, `power2.inOut` morphs. Stagger: `0.08` text, `0.15` cards.

---

## Component Architecture

Preset-specific; use the section for the selected preset in [preset-architectures.md](preset-architectures.md).

| Section | Name | One-line |
|---------|------|----------|
| **A** | Navbar | Fixed pill "Floating Island"; transparent → `bg-[background]/60 backdrop-blur-xl` on scroll; logo, 3-4 links, accent CTA. |
| **B** | Hero | "Opening Shot": `100dvh`, full-bleed image + primary-to-black gradient; content bottom-left; preset hero line pattern; GSAP stagger fade-up; accent CTA. |
| **C** | Features | 3 cards = value props. Card 1: Diagnostic Shuffler (cycling cards). Card 2: Telemetry Typewriter (monospace typewriter + cursor). Card 3: Cursor Protocol Scheduler (week grid + animated cursor). |
| **D** | Philosophy | "Manifesto": dark bg, parallax texture; two statements (common approach vs "We focus on:" drama serif); ScrollTrigger word/line reveal. |
| **E** | Protocol | 3 full-screen sticky cards; pin + scale/blur/fade underneath; each card: unique canvas/SVG (rotating motif, scanning line, EKG waveform). |
| **F** | Membership/Pricing | Three-tier grid; middle card pops (primary bg, accent CTA). Or single "Get Started" CTA if no pricing. |
| **G** | Footer | Deep dark, `rounded-t-[4rem]`; brand + nav + legal; "System Operational" with pulsing green dot + monospace. |

---

## Technical Requirements (NEVER CHANGE)

- **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 + ScrollTrigger, Lucide React.
- **Fonts:** Google Fonts `<link>` in `index.html` per preset (see reference).
- **Images:** Real Unsplash URLs matching preset `imageMood`. No placeholders.
- **Structure:** Single `App.jsx` (or `components/` if >600 lines), single `index.css` (Tailwind + noise overlay + utilities).
- **Responsive:** Mobile-first; stack cards, reduce hero sizes, collapse navbar.

---

## Build Sequence (after answers)

1. Map selected preset to design tokens (palette, fonts, imageMood, identity) and load that preset's component architecture from [preset-architectures.md](preset-architectures.md).
2. Generate hero copy from brand + purpose + preset hero line pattern.
3. Map 3 value props to the 3 Feature card patterns (Shuffler, Typewriter, Scheduler).
4. Generate Philosophy contrast statements from brand purpose.
5. Generate Protocol steps from brand process/methodology.
6. Scaffold (e.g. `npm create vite@latest`), install deps, write all files.
7. Wire every animation and interaction; ensure every image loads.

No placeholders. Every card, label, and animation must be fully implemented and functional.
