# Preset Architectures

Component architecture per aesthetic preset. **Currently identical for all presets**; edit each section when you want preset-specific layouts or interactions.

Design tokens (palette, typography, image mood): [reference.md](reference.md).

---

## Preset A — Organic Tech

### A. NAVBAR — "The Floating Island"

- `fixed` pill-shaped container, horizontally centered.
- **Morphing:** Transparent with light text at hero top. On scroll past hero → `bg-[background]/60 backdrop-blur-xl`, primary-colored text, subtle `border`. Use `IntersectionObserver` or ScrollTrigger.
- Content: Logo (brand name as text), 3-4 nav links, CTA button (accent).

### B. HERO SECTION — "The Opening Shot"

- Height `100dvh`. Full-bleed background image (Unsplash, preset `imageMood`) with strong **primary-to-black** gradient overlay (`bg-gradient-to-t`).
- **Layout:** Content in **bottom-left third** (flex + padding).
- **Typography:** Preset hero line pattern. First part: bold sans heading. Second part: massive serif italic (3-5x size difference).
- **Animation:** GSAP staggered fade-up (y: 40 → 0, opacity: 0 → 1) for text and CTA.
- CTA below headline, accent color.

### C. FEATURES — "Interactive Functional Artifacts"

Three cards from the 3 value propositions. Feel like **functional software micro-UIs**, not static cards.

- **Card 1 — Diagnostic Shuffler:** 3 overlapping cards that cycle vertically with `array.unshift(array.pop())` every 3s, spring-bounce `cubic-bezier(0.34, 1.56, 0.64, 1)`. Labels from first value prop (generate 3 sub-labels).
- **Card 2 — Telemetry Typewriter:** Monospace live-text feed, types out messages character-by-character (second value prop), blinking accent cursor. "Live Feed" label with pulsing dot.
- **Card 3 — Cursor Protocol Scheduler:** Weekly grid (S M T W T F S). Animated SVG cursor enters, moves to a day, clicks (visual `scale(0.95)`), activates day (accent highlight), moves to "Save", fades out. Labels from third value prop.

All cards: `bg-[background]`, subtle border, `rounded-[2rem]`, drop shadow. Heading (sans bold) + short descriptor.

### D. PHILOSOPHY — "The Manifesto"

- Full-width, **dark** background.
- Parallax organic texture image (Unsplash, `imageMood`) at low opacity behind text.
- **Copy pattern:**
  - "Most [industry] focuses on: [common approach]." — neutral, smaller.
  - "We focus on: [differentiated approach]." — massive drama serif italic, accent keyword.
- **Animation:** GSAP SplitText-style reveal (word or line fade-up) on ScrollTrigger.

### E. PROTOCOL — "Sticky Stacking Archive"

- 3 full-screen cards that stack on scroll.
- **Stacking:** GSAP ScrollTrigger `pin: true`. When a new card enters view, previous card scales to `0.9`, blur `20px`, opacity `0.5`.
- **Per-card canvas/SVG:**
  1. Slowly rotating geometric motif (double-helix, concentric circles, or gear teeth).
  2. Scanning horizontal laser-line over a grid of dots/cells.
  3. Pulsing waveform (EKG-style SVG path, `stroke-dashoffset`).
- Content: Step number (monospace), title (heading font), 2-line description. Derive from brand purpose.

### F. MEMBERSHIP / PRICING

- Three-tier grid. Names: "Essential", "Performance", "Enterprise" (or brand-appropriate).
- **Middle card:** Primary background, accent CTA, slightly larger or `ring` border.
- If no pricing: single "Get Started" section with one large CTA.

### G. FOOTER

- Deep dark background, `rounded-t-[4rem]`.
- Grid: Brand + tagline, nav columns, legal links.
- **"System Operational"** status: pulsing green dot + monospace label.

---

## Preset B — Midnight Luxe

*(Same architecture as Preset A — see above. Edit this section for preset-specific changes.)*

### A. NAVBAR — "The Floating Island"

- `fixed` pill-shaped container, horizontally centered.
- **Morphing:** Transparent with light text at hero top. On scroll past hero → `bg-[background]/60 backdrop-blur-xl`, primary-colored text, subtle `border`. Use `IntersectionObserver` or ScrollTrigger.
- Content: Logo (brand name as text), 3-4 nav links, CTA button (accent).

### B. HERO SECTION — "The Opening Shot"

- Height `100dvh`. Full-bleed background image (Unsplash, preset `imageMood`) with strong **primary-to-black** gradient overlay (`bg-gradient-to-t`).
- **Layout:** Content in **bottom-left third** (flex + padding).
- **Typography:** Preset hero line pattern. First part: bold sans heading. Second part: massive serif italic (3-5x size difference).
- **Animation:** GSAP staggered fade-up (y: 40 → 0, opacity: 0 → 1) for text and CTA.
- CTA below headline, accent color.

### C. FEATURES — "Interactive Functional Artifacts"

Three cards from the 3 value propositions. Feel like **functional software micro-UIs**, not static cards.

- **Card 1 — Diagnostic Shuffler:** 3 overlapping cards that cycle vertically with `array.unshift(array.pop())` every 3s, spring-bounce `cubic-bezier(0.34, 1.56, 0.64, 1)`. Labels from first value prop (generate 3 sub-labels).
- **Card 2 — Telemetry Typewriter:** Monospace live-text feed, types out messages character-by-character (second value prop), blinking accent cursor. "Live Feed" label with pulsing dot.
- **Card 3 — Cursor Protocol Scheduler:** Weekly grid (S M T W T F S). Animated SVG cursor enters, moves to a day, clicks (visual `scale(0.95)`), activates day (accent highlight), moves to "Save", fades out. Labels from third value prop.

All cards: `bg-[background]`, subtle border, `rounded-[2rem]`, drop shadow. Heading (sans bold) + short descriptor.

### D. PHILOSOPHY — "The Manifesto"

- Full-width, **dark** background.
- Parallax organic texture image (Unsplash, `imageMood`) at low opacity behind text.
- **Copy pattern:**
  - "Most [industry] focuses on: [common approach]." — neutral, smaller.
  - "We focus on: [differentiated approach]." — massive drama serif italic, accent keyword.
- **Animation:** GSAP SplitText-style reveal (word or line fade-up) on ScrollTrigger.

### E. PROTOCOL — "Sticky Stacking Archive"

- 3 full-screen cards that stack on scroll.
- **Stacking:** GSAP ScrollTrigger `pin: true`. When a new card enters view, previous card scales to `0.9`, blur `20px`, opacity `0.5`.
- **Per-card canvas/SVG:**
  1. Slowly rotating geometric motif (double-helix, concentric circles, or gear teeth).
  2. Scanning horizontal laser-line over a grid of dots/cells.
  3. Pulsing waveform (EKG-style SVG path, `stroke-dashoffset`).
- Content: Step number (monospace), title (heading font), 2-line description. Derive from brand purpose.

### F. MEMBERSHIP / PRICING

- Three-tier grid. Names: "Essential", "Performance", "Enterprise" (or brand-appropriate).
- **Middle card:** Primary background, accent CTA, slightly larger or `ring` border.
- If no pricing: single "Get Started" section with one large CTA.

### G. FOOTER

- Deep dark background, `rounded-t-[4rem]`.
- Grid: Brand + tagline, nav columns, legal links.
- **"System Operational"** status: pulsing green dot + monospace label.

---

## Preset C — Brutalist Signal

*(Same architecture as Preset A — see above. Edit this section for preset-specific changes.)*

### A. NAVBAR — "The Floating Island"

- `fixed` pill-shaped container, horizontally centered.
- **Morphing:** Transparent with light text at hero top. On scroll past hero → `bg-[background]/60 backdrop-blur-xl`, primary-colored text, subtle `border`. Use `IntersectionObserver` or ScrollTrigger.
- Content: Logo (brand name as text), 3-4 nav links, CTA button (accent).

### B. HERO SECTION — "The Opening Shot"

- Height `100dvh`. Full-bleed background image (Unsplash, preset `imageMood`) with strong **primary-to-black** gradient overlay (`bg-gradient-to-t`).
- **Layout:** Content in **bottom-left third** (flex + padding).
- **Typography:** Preset hero line pattern. First part: bold sans heading. Second part: massive serif italic (3-5x size difference).
- **Animation:** GSAP staggered fade-up (y: 40 → 0, opacity: 0 → 1) for text and CTA.
- CTA below headline, accent color.

### C. FEATURES — "Interactive Functional Artifacts"

Three cards from the 3 value propositions. Feel like **functional software micro-UIs**, not static cards.

- **Card 1 — Diagnostic Shuffler:** 3 overlapping cards that cycle vertically with `array.unshift(array.pop())` every 3s, spring-bounce `cubic-bezier(0.34, 1.56, 0.64, 1)`. Labels from first value prop (generate 3 sub-labels).
- **Card 2 — Telemetry Typewriter:** Monospace live-text feed, types out messages character-by-character (second value prop), blinking accent cursor. "Live Feed" label with pulsing dot.
- **Card 3 — Cursor Protocol Scheduler:** Weekly grid (S M T W T F S). Animated SVG cursor enters, moves to a day, clicks (visual `scale(0.95)`), activates day (accent highlight), moves to "Save", fades out. Labels from third value prop.

All cards: `bg-[background]`, subtle border, `rounded-[2rem]`, drop shadow. Heading (sans bold) + short descriptor.

### D. PHILOSOPHY — "The Manifesto"

- Full-width, **dark** background.
- Parallax organic texture image (Unsplash, `imageMood`) at low opacity behind text.
- **Copy pattern:**
  - "Most [industry] focuses on: [common approach]." — neutral, smaller.
  - "We focus on: [differentiated approach]." — massive drama serif italic, accent keyword.
- **Animation:** GSAP SplitText-style reveal (word or line fade-up) on ScrollTrigger.

### E. PROTOCOL — "Sticky Stacking Archive"

- 3 full-screen cards that stack on scroll.
- **Stacking:** GSAP ScrollTrigger `pin: true`. When a new card enters view, previous card scales to `0.9`, blur `20px`, opacity `0.5`.
- **Per-card canvas/SVG:**
  1. Slowly rotating geometric motif (double-helix, concentric circles, or gear teeth).
  2. Scanning horizontal laser-line over a grid of dots/cells.
  3. Pulsing waveform (EKG-style SVG path, `stroke-dashoffset`).
- Content: Step number (monospace), title (heading font), 2-line description. Derive from brand purpose.

### F. MEMBERSHIP / PRICING

- Three-tier grid. Names: "Essential", "Performance", "Enterprise" (or brand-appropriate).
- **Middle card:** Primary background, accent CTA, slightly larger or `ring` border.
- If no pricing: single "Get Started" section with one large CTA.

### G. FOOTER

- Deep dark background, `rounded-t-[4rem]`.
- Grid: Brand + tagline, nav columns, legal links.
- **"System Operational"** status: pulsing green dot + monospace label.

---

## Preset D — Vapor Clinic

*(Same architecture as Preset A — see above. Edit this section for preset-specific changes.)*

### A. NAVBAR — "The Floating Island"

- `fixed` pill-shaped container, horizontally centered.
- **Morphing:** Transparent with light text at hero top. On scroll past hero → `bg-[background]/60 backdrop-blur-xl`, primary-colored text, subtle `border`. Use `IntersectionObserver` or ScrollTrigger.
- Content: Logo (brand name as text), 3-4 nav links, CTA button (accent).

### B. HERO SECTION — "The Opening Shot"

- Height `100dvh`. Full-bleed background image (Unsplash, preset `imageMood`) with strong **primary-to-black** gradient overlay (`bg-gradient-to-t`).
- **Layout:** Content in **bottom-left third** (flex + padding).
- **Typography:** Preset hero line pattern. First part: bold sans heading. Second part: massive serif italic (3-5x size difference).
- **Animation:** GSAP staggered fade-up (y: 40 → 0, opacity: 0 → 1) for text and CTA.
- CTA below headline, accent color.

### C. FEATURES — "Interactive Functional Artifacts"

Three cards from the 3 value propositions. Feel like **functional software micro-UIs**, not static cards.

- **Card 1 — Diagnostic Shuffler:** 3 overlapping cards that cycle vertically with `array.unshift(array.pop())` every 3s, spring-bounce `cubic-bezier(0.34, 1.56, 0.64, 1)`. Labels from first value prop (generate 3 sub-labels).
- **Card 2 — Telemetry Typewriter:** Monospace live-text feed, types out messages character-by-character (second value prop), blinking accent cursor. "Live Feed" label with pulsing dot.
- **Card 3 — Cursor Protocol Scheduler:** Weekly grid (S M T W T F S). Animated SVG cursor enters, moves to a day, clicks (visual `scale(0.95)`), activates day (accent highlight), moves to "Save", fades out. Labels from third value prop.

All cards: `bg-[background]`, subtle border, `rounded-[2rem]`, drop shadow. Heading (sans bold) + short descriptor.

### D. PHILOSOPHY — "The Manifesto"

- Full-width, **dark** background.
- Parallax organic texture image (Unsplash, `imageMood`) at low opacity behind text.
- **Copy pattern:**
  - "Most [industry] focuses on: [common approach]." — neutral, smaller.
  - "We focus on: [differentiated approach]." — massive drama serif italic, accent keyword.
- **Animation:** GSAP SplitText-style reveal (word or line fade-up) on ScrollTrigger.

### E. PROTOCOL — "Sticky Stacking Archive"

- 3 full-screen cards that stack on scroll.
- **Stacking:** GSAP ScrollTrigger `pin: true`. When a new card enters view, previous card scales to `0.9`, blur `20px`, opacity `0.5`.
- **Per-card canvas/SVG:**
  1. Slowly rotating geometric motif (double-helix, concentric circles, or gear teeth).
  2. Scanning horizontal laser-line over a grid of dots/cells.
  3. Pulsing waveform (EKG-style SVG path, `stroke-dashoffset`).
- Content: Step number (monospace), title (heading font), 2-line description. Derive from brand purpose.

### F. MEMBERSHIP / PRICING

- Three-tier grid. Names: "Essential", "Performance", "Enterprise" (or brand-appropriate).
- **Middle card:** Primary background, accent CTA, slightly larger or `ring` border.
- If no pricing: single "Get Started" section with one large CTA.

### G. FOOTER

- Deep dark background, `rounded-t-[4rem]`.
- Grid: Brand + tagline, nav columns, legal links.
- **"System Operational"** status: pulsing green dot + monospace label.

---

## Preset E — Island Vital

Retreat & movement: softer interactions, organic motion, flow over control-room density.

### A. NAVBAR — "The Floating Island"

- `fixed` pill-shaped container, horizontally centered.
- **Morphing:** Transparent with light text at hero top. On scroll past hero → `bg-[background]/60 backdrop-blur-xl`, primary-colored text, subtle `border`. Use `IntersectionObserver` or ScrollTrigger.
- Content: Logo (brand name as text), 3-4 nav links, CTA button (accent).

### B. HERO SECTION — "The Opening Shot"

- Height `100dvh`. Full-bleed background image (Unsplash, preset `imageMood`) with strong **primary-to-black** gradient overlay (`bg-gradient-to-t`).
- **Layout:** Content in **bottom-left third** (flex + padding).
- **Typography:** Preset hero line pattern. First part: bold sans heading. Second part: massive serif italic (3-5x size difference).
- **Animation:** GSAP staggered fade-up (y: 40 → 0, opacity: 0 → 1) for text and CTA.
- CTA below headline, accent color.

### C. FEATURES — "Flow Cards"

Three cards from the 3 value propositions. **Organic, light motion** — no control-room UI.

- **Card 1 — Breath Cycle:** Single card for first value prop. Subtle breathing scale (e.g. `scale(1) → 1.02` over ~4s, smooth loop) or soft opacity pulse. Optional: very light SVG circle that expands/contracts. Heading (sans bold) + short descriptor.
- **Card 2 — Flow Line:** Second value prop. A single flowing SVG path (e.g. gentle curve or wave) that draws in with `stroke-dashoffset` animation on enter (ScrollTrigger or in view). No typewriter; calm, minimal. Heading + short descriptor.
- **Card 3 — Week Rhythm:** Third value prop. Simple week grid (M-S or 7 dots). No cursor. Days highlight in sequence on a timer (e.g. one lights up every 1.5s, accent color, then resets or loops). Suggests "your week in flow" without scheduler UI. Heading + short descriptor.

All cards: `bg-[background]`, subtle border, `rounded-[2rem]`, drop shadow. Softer shadows than other presets; optional light gradient border (primary/10).

### D. PHILOSOPHY — "The Manifesto"

- Full-width, **dark** background (use primary teal/stone, not pure black).
- Parallax organic texture (Unsplash, `imageMood`) at low opacity behind text.
- **Copy pattern:** Same structure, warmer tone. "Most [industry] focus on: [common approach]." / "We focus on: [differentiated approach]." — massive drama serif italic, accent keyword. Language: transformation, flow, presence, not "system" or "protocol".
- **Animation:** GSAP word or line fade-up on ScrollTrigger (same as others).

### E. PROTOCOL — "Sticky Stacking Archive"

- 3 full-screen cards that stack on scroll (same pin/scale/blur behavior).
- **Per-card canvas/SVG** (organic, not tech):
  1. **Wave:** Horizontal sine wave or gentle ocean wave SVG, slow horizontal drift or vertical undulate. `stroke-dashoffset` or transform.
  2. **Sun / Breath:** Concentric circles that gently scale in/out (breath) or a sun arc (half-circle) that rises/sets slowly. Soft, no sharp lines.
  3. **Flow Path:** Single flowing path (e.g. curved trail, river, or figure-8) that draws in with `stroke-dashoffset`. Evokes journey or flow.
- Content: Step number (monospace), title (heading font), 2-line description. Derive from brand purpose (e.g. "Arrive", "Move", "Return" or retreat steps).

### F. MEMBERSHIP / PRICING

- Three-tier grid. Names: retreat-appropriate (e.g. "Morning Flow", "Full Week", "Private Retreat") or brand-appropriate.
- **Middle card:** Primary background, accent CTA, slightly larger or `ring` border.
- If no pricing: single "Get Started" / "Reserve your spot" section with one large CTA.

### G. FOOTER

- Deep dark background (primary/stone), `rounded-t-[4rem]`.
- Grid: Brand + tagline, nav columns, legal links.
- **Status:** Pulsing dot + short label. Prefer "You're ready." or "Retreat ready." with soft green or accent dot; monospace optional. If brand is more structured, "System Operational" is fine.
