---
name: IT FEST 6.0
description: Sea-to-sand tropical festival landing — retro comic-poster energy, HIMTI event registration
colors:
  coral: "#EB3C6B"
  lime: "#B5D948"
  yellow: "#FED245"
  orange: "#F6890C"
  ocean-blue: "#31AECE"
  sea-light: "#5FC8E4"
  sea-deep: "#1E86AC"
  navy: "#082E4B"
  ink: "#0F172A"
  muted: "#5A6A7E"
  sand: "#FDF5E4"
  wet-sand: "#E7D4A6"
  outline: "#000000"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.85
  label:
    fontFamily: "Fredoka, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  pill: "99px"
  card: "18px"
  card-sm: "16px"
  node: "50%"
spacing:
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "76px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "13px 30px"
  button-ghost:
    backgroundColor: "#ffffff"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "13px 30px"
  card-booth:
    backgroundColor: "#ffffff"
    rounded: "{rounded.card}"
    padding: "20px"
---

# Design System: IT FEST 6.0

## 1. Overview

**Creative North Star: "The Sea-to-Sand Journey"**

The landing page is one continuous descent: sky, into open sea, into deep sea, onto sand — each section a leg of the same trip, not an independent slide. Color itself carries the narrative (gradients shift hue section to section) and `FoamDivider` wave seams stitch each transition together so the scroll never cuts, it flows. On top of that current sits a retro comic-poster voice: thick black outlines, offset hard shadows, hand-tilted stickers — playful and energetic, built for a student festival, not a corporate brand.

This system explicitly rejects the generic AI-SaaS landing page: no beige card grids, no gradient text, no timid pastel restraint. It commits fully to a loud tropical palette and a hand-crafted illustrated world (custom SVG sun, fish, hibiscus, starburst) instead of stock icons.

**Key Characteristics:**
- Section backgrounds gradient into each other; `FoamDivider` seams make the transition physical, not a hard cut.
- Every card, button, and node shares one shape language: 3px black border + flat offset shadow (no blur).
- Scroll reveals stagger per item (`--reveal-delay`), never fire as one uniform block entrance.
- Full `prefers-reduced-motion` parity: every drift, bob, parallax and reveal has an instant/static fallback.

## 2. Colors

A full, committed tropical palette — six named hues plus sand neutrals, each with an assigned narrative role (sky/sea/sand), not a restrained accent-on-neutral system.

### Primary
- **Coral** (`#EB3C6B`): the one CTA color. Every "Daftar" / registration button, nav CTA, and footer CTA uses this — the single anchor a visitor learns to click.

### Secondary
- **Lime** (`#B5D948`): title stroke-fill color for the "groovy" poster headline treatment; also the IoT/Hackathon category color.
- **Sunny Yellow** (`#FED245`): sun illustration, highlight sticker tags, Bazaar category.

### Tertiary
- **Tropical Orange** (`#F6890C`): warm accent — sunset gradients, Hackathon Final Day marker.
- **Ocean Blue** (`#31AECE`) with **Sea Light** (`#5FC8E4`) and **Sea Deep** (`#1E86AC`): the sea gradient ramp. Never used as flat fills alone — always as a vertical `linear-gradient` stop pair driving the sky→sea→deep narrative.

### Neutral
- **Deep Navy** (`#082E4B`): primary text-on-light, footer background, ghost-button label color.
- **Ink** (`#0F172A`) / **Muted Slate** (`#5A6A7E`): secondary body text where navy would be too heavy.
- **Sand** (`#FDF5E4`) / **Wet Sand** (`#E7D4A6`): the beach-landing neutral. This *is* a warm near-white, but it's earned — it's the literal endpoint of the sea-to-sand narrative, not a default AI beige. Don't treat it as a generic body background elsewhere.
- **Outline Black** (`#000000`): every border and offset-shadow in the system. Never softened to gray.

### Named Rules
**The One CTA Rule.** Coral is the only color used for a primary action button anywhere on the page. Category cards may borrow it as a *label* color, but a second coral CTA competing with the main "Daftar" button is a bug, not a variant.

## 3. Typography

**Display Font:** Space Grotesk (weights 500/600/700)
**Body Font:** Plus Jakarta Sans (400–800, italic available)
**Label/Button Font:** Fredoka (600)

**Character:** A geometric, slightly mechanical display face carries the "groovy" poster headlines (thick outline-stroke + drop shadow treatment), paired with a warm, rounder body sans so long-form copy stays readable against loud backgrounds.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 6vw, 4rem)`, 1.05): Hero headline only, rendered with the `.groovy` outline-stroke + double-shadow treatment.
- **Headline** (600, ~28–32px): Section titles ("Tentang", "Rangkaian Acara", "Lomba").
- **Body** (500, 15px, 1.85 line-height): Paragraph copy on colored section backgrounds — the generous line-height is load-bearing for legibility on saturated blue/navy fills.
- **Label** (600, 14px, uppercase on tags): Sticker tags (`.k-tag`), button labels — intended in Fredoka's rounder shape for a friendlier CTA voice than the display face.

### Named Rules
**The Groovy-Once Rule.** The stroke+double-shadow "groovy" title effect is reserved for the hero H1 alone. Applying it to section headings would flatten it from "signature move" to "template."

**The Missing Fredoka Gap.** `Fredoka` is declared on `.k-btn` and `.k-tag` but never loaded (no `@import`, no `next/font`) — it is silently falling back to the body sans. Load it alongside Space Grotesk / Plus Jakarta Sans in the existing `@import` line, or the button voice is quietly wrong.

## 4. Elevation

**Comic-Offset.** No blur, ever. Depth is communicated through a flat, solid-black offset shadow (`Npx Npx 0 #000`) paired with a 3px black border — the cut-paper/sticker look, not a soft modern drop-shadow. Hover states punch the offset down (press-in), not up (lift), reinforcing a tactile "sticker being pressed" feel rather than a floating-card feel.

### Shadow Vocabulary
- **card** (`box-shadow: 6px 6px 0 #000`): booths, k-cards. Hover → `9px 9px 0 #000` + `translate(-2px,-4px)` (lifts away).
- **button** (`box-shadow: 5px 5px 0 #000`): `.k-btn` default. Hover → `2px 2px 0 #000` + `translate(2px,2px)` (presses in). Active → shadow removed entirely + full translate (fully pressed).
- **node / tag / rute-card**: same offset family at smaller scale (3px–5px).

### Named Rules
**The Press-Don't-Lift Rule.** Buttons compress on hover/active (shadow shrinks, element moves toward the shadow); cards lift on hover (shadow grows, element moves away). The two directions are deliberate — don't unify them into one hover behavior.

## 5. Components

### Buttons
- **Shape:** Full pill (`border-radius: 99px`), 3px black border.
- **Primary:** Coral background (`{colors.coral}`), white text, `13px 30px` padding on hero-scale CTAs, `9px 22px` on nav-scale.
- **Ghost:** White background, navy text — used only for secondary in-hero actions ("Selengkapnya" next to the coral "Daftar" CTA).
- **Hover / Focus:** See Comic-Offset press behavior above. Focus-visible gets a 3px yellow dashed outline, offset 3px — never rely on the shadow change alone for keyboard focus.

### Chips / Tags
- **Style:** `.k-tag` — pill-shaped sticker, 2.5px black border, small offset shadow, slight `-1.5deg` rotation for a hand-placed feel. Uppercase, 11px, letter-spacing `.12em`.

### Cards / Containers ("Booths")
- **Corner Style:** 18px radius (`.booth`, `.k-card`), 16px for timeline rute-cards.
- **Background:** White, always — cards are the one place pure white appears, so illustrated/gradient backgrounds have somewhere to rest the eye.
- **Shadow Strategy:** Comic-Offset, lift-on-hover (see Elevation).
- **Border:** 3px solid black, universal.
- **Internal Padding:** roughly 20px; category icon + label + sub-copy stacked.

### Navigation
- Sticky (`position: sticky`, `zIndex: 60`), coral CTA pinned right, burger menu below 800px.

### Signature Component: FoamDivider
A tiled SVG wave with a foam-texture fill, rendered between every major section — the connective tissue of the sea-to-sand narrative. Colors are always the section-above's background bleeding into the section-below's, so the seam reads as continuous water, not a template accordion divider. Includes deterministic `Bubbles`, drifting `Fish`, and `LightShafts` SVG illustrations layered at `z-index: 0` beneath a `z-index: 1`+ content container — the illustrated layer must never out-rank content in the stacking order.

## 6. Do's and Don'ts

### Do:
- **Do** keep coral (`#EB3C6B`) as the only primary-CTA color across the entire page (The One CTA Rule).
- **Do** use flat offset shadows (`Npx Npx 0 #000`), never blur, for every card/button/node (Comic-Offset).
- **Do** stagger `data-reveal` entrances per item via `--reveal-delay`; never one uniform block fade.
- **Do** pair every animation with a `prefers-reduced-motion` static fallback — already the pattern for parallax, bubbles, fish, shafts; keep it that way for anything new.
- **Do** keep decorative illustration layers (`Bubbles`, `Fish`, `LightShafts`) at `z-index: 0`, strictly beneath the content container's `z-index: 1`+, and `pointer-events: none`.

### Don't:
- **Don't** add a second coral (or any other) CTA competing with the primary "Daftar" button on the same viewport.
- **Don't** soften the outline-black borders/shadows to gray "for elegance" — the hard black line is the system's signature, not a rough edge to polish away.
- **Don't** let decorative `Fish` / `Bubbles` swim across a section's headline or CTA button band. Known gap: `Fish`'s `top` percentage is fixed regardless of viewport, so at narrow/tablet widths where content reflows taller, a fish's swim path can visually cross a heading or card row it was never positioned against on desktop. Keep fish `top` values inside empty gradient bands (roughly the 60–90% zone away from text blocks), or hide instances that land near content at `max-width: 800px` the same way `.hero-beach` is hidden today.
- **Don't** apply the hero's stroke+double-shadow "groovy" title effect to any other heading (The Groovy-Once Rule).
- **Don't** introduce a beige/cream/paper background anywhere outside the literal sand-landing section — `sand`/`wet-sand` are a narrative destination, not a general-purpose neutral.
- **Don't** ship `Fredoka` references without loading the font — either add it to the existing Google Fonts `@import` or drop the `font-family` reference (The Missing Fredoka Gap).
