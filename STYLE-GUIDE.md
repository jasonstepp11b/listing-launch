# ListingIgnite — Design System Reference

Visual style guide page: `/style-guide` (dev only — not rendered in production builds)

---

## Design Principles

- **Dark, premium aesthetic.** Every surface is dark. No light-mode variants exist.
- **Purple as the single accent color.** `#a855f7` / `#8b2fe8` / `#7c3aed` are the only brand colors. Use them intentionally — CTAs, active states, badges, and highlights only.
- **Restrained palette.** All UI color comes from a single family of greys (`#f3f4f6` → `#0c0c12`) plus purple. Status colors (green/gold/red) appear only in semantic contexts (success, sold, error).
- **Tight typography.** Headings use negative letter spacing (`-1px` to `-2px`). Body text is loose (`1.6`–`1.7` line height). The contrast is intentional.
- **Transparent surfaces.** Colored backgrounds almost always use `rgba` at low opacity (0.05–0.15), not solid colors. This keeps layering coherent on dark backgrounds.
- **No borders for decoration.** Borders exist only to define edges. Color: `#2e2e3a` (standard), `#3a3a4a` (inputs), `#1e1e28` (section dividers).

---

## Color Palette

### Backgrounds

| Token | Value | Usage |
|---|---|---|
| Page dark | `#0c0c12` | Root page background (app pages) |
| Page purple-tint | `#150e1f` | Landing page background (mid) |
| Page variant | `#1a1025` | Login / legal page background |
| Surface / Card | `#1a1a22` | All cards, modals, tab bodies |
| Input | `#13131a` | All form inputs, textareas, select |
| Hover surface | `#16161e` | Card hover, subtle elevation |

### Purple Accent (Brand)

| Token | Value | Usage |
|---|---|---|
| Accent primary | `#8b2fe8` | Button gradients (start) |
| Accent dark | `#7c3aed` | Button gradients (end), active states |
| Accent base | `#a855f7` | Icons, highlights, active tabs, sparkles |
| Accent light | `#c084fc` | Muted labels, pill badges, credit text |
| Purple tint 15% | `rgba(168,85,247,0.15)` | Active tags, feature pills |
| Purple tint 10% | `rgba(168,85,247,0.10)` | Hover states, secondary button bg |
| Purple tint 8% | `rgba(168,85,247,0.08)` | Free credits callout, very subtle tints |
| Purple tint 5% | `rgba(168,85,247,0.05)` | Problem card, highlight card bg |

### Text

| Token | Value | Usage |
|---|---|---|
| Primary | `#f3f4f6` | Headings, bold labels, strong text |
| Secondary | `#e5e7eb` | Section titles, card headings |
| Tertiary | `#d1d5db` | Form labels, less-prominent headings |
| Muted | `#a0a8b8` | Body copy, descriptions, subtitles |
| Hint | `#6b7280` | Placeholders, timestamps, footer copy |
| Disabled | `#4b5563` | Disabled text, fine print, copyright |
| Very dark | `#3a3a4a` | Borders used as text separators |

### Borders

| Value | Usage |
|---|---|
| `#2e2e3a` | Standard card / component border |
| `#3a3a4a` | Input borders, dashed upload zones |
| `#1e1e28` | Section dividers (horizontal rules between page sections) |
| `rgba(168,85,247,0.35)` | Active/highlighted component border (paywall, purple cards) |
| `rgba(168,85,247,0.25)` | Secondary purple border (property type badge) |
| `rgba(168,85,247,0.20)` | Subtle purple border (free credits badge) |

### Semantic / Status Colors

| State | Background | Border | Text |
|---|---|---|---|
| Active (green) | `rgba(34,197,94,0.10)` | `rgba(34,197,94,0.30)` | `#86efac` |
| Sold (gold) | `rgba(234,179,8,0.12)` | `rgba(234,179,8,0.35)` | `#fde047` |
| Inactive (grey) | `rgba(75,85,99,0.20)` | `#3a3a4a` | `#a0a8b8` |
| Error (red) | `rgba(239,68,68,0.10)` | `rgba(239,68,68,0.30)` | `#fca5a5` |
| Warning (amber) | `rgba(251,191,36,0.08)` | `rgba(251,191,36,0.20)` | `#fbbf24` |
| Success (green) | `rgba(34,197,94,0.08)` | `rgba(34,197,94,0.25)` | `#86efac` |

### Gradients

| Name | Value | Usage |
|---|---|---|
| Primary CTA | `linear-gradient(135deg, #8b2fe8, #7c3aed)` | All primary buttons, submit buttons |
| Progress bar | `linear-gradient(90deg, #8b2fe8, #a855f7)` | Generation progress bar fill |
| Text accent | `linear-gradient(135deg, #a855f7, #7c3aed)` | Hero headline accent word |
| Page background | `linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)` | Login, legal pages |
| Landing background | `linear-gradient(160deg, #0c0c12 0%, #150e1f 60%, #0c0c12 100%)` | Landing page only |
| Highlight card | `linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)` | Paywall banner, problem card |
| Decorative glow | `radial-gradient(ellipse at center, rgba(139,47,232,0.2) 0%, transparent 70%)` | Hero, CTA section background glow |

---

## Typography

**Font Family:** `system-ui, "Segoe UI", Roboto, sans-serif` — applied to the page and `fontFamily: inherit` on all interactive elements.

### Scale

| Role | Size | Weight | Letter Spacing | Line Height |
|---|---|---|---|---|
| Hero / Display | `64px` | `800` | `-2px` | `1.08` |
| H1 / Page title | `36–40px` | `800` | `-1px` | `1.1` |
| H2 / Section | `28px` | `700` | `-0.5px` | `1.35` |
| H3 / Card title | `20px` | `700` | `-0.3px` | `1.4` |
| H4 / Subsection | `16px` | `700` | `-0.2px` | `1.4` |
| Body large | `18px` | `400` | `0` | `1.65` |
| Body default | `15px` | `400` | `0` | `1.7` |
| Body small | `14px` | `400` | `0` | `1.65` |
| Small / Hint | `13px` | `400` | `0` | `1.6` |
| Micro / Note | `12px` | `400` | `0` | `1.5` |
| Label (uppercase) | `12px` | `600` | `0.5px` | `1` |
| Section eyebrow | `12px` | `600` | `1px` | `1` |
| Step number | `11px` | `700` | `1.5px` | `1` |

### Rules
- Always use negative letter spacing on headings (tighter = more premium)
- Body copy on dark backgrounds: `#a0a8b8` (muted), not pure white — reduces eye strain
- Uppercase labels get `letterSpacing: '0.5px'` minimum — all-caps without tracking looks cramped
- `fontFamily: 'inherit'` on all `<button>`, `<input>`, `<textarea>`, `<select>` — never rely on browser defaults

---

## Border Radius

| Value | Usage |
|---|---|
| `3px` | `<kbd>` keyboard shortcuts, very small inline elements |
| `6px` | Chips, small tag pills |
| `7px` | Small buttons, inputs (Login page style) |
| `8px` | Standard buttons, inputs (app-wide style) |
| `9px` | Medium button variant |
| `10px` | Modal inner content areas |
| `12px` | FAQ accordion items, medium surfaces |
| `14px` | Standard card (dashboard cards, output sections) |
| `16px` | Large cards (feature cards, profile sections) |
| `20px` | Hero/CTA highlight cards, pill badges |
| `50%` | Avatar circles, icon containers |

---

## Shadows & Elevation

| Name | Value | Usage |
|---|---|---|
| Button (purple) | `0 4px 14px rgba(139,47,232,0.4)` | Primary buttons (default size) |
| Button large (purple) | `0 8px 32px rgba(139,47,232,0.45)` | Hero CTA, large landing CTAs |
| Card / modal | `0 24px 48px rgba(0,0,0,0.4)` | Login card, modal overlays |
| Modal heavy | `0 24px 64px rgba(0,0,0,0.6)` | Full-screen modals |

**Rule:** Shadows on dark UI use `rgba(0,0,0,X)` (black) for neutral elevation, and `rgba(139,47,232,X)` (purple) on primary interactive elements to reinforce brand.

---

## Spacing Scale

Pixel-based. No design tokens library. Use values from this list — do not introduce new arbitrary values.

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 48 · 56 · 64 · 80 · 96`

### Common Patterns
- **Section padding (top/bottom):** `72px` (post-hero) — reduced from `96px` in the initial build
- **Card padding:** `24px` (standard), `28px 32px` (section/profile), `36px 28px` (feature cards)
- **Page max-width:** `1120px` (content), `760px` (narrow/centered content), `640px` (CTA sections)
- **Page horizontal padding:** `24px` (all breakpoints)
- **Gap between cards:** `20–24px` for grid layouts, `16px` for tight lists
- **Form field gap:** `14px` between stacked fields

---

## Component Patterns

### Card
```
background: #1a1a22
border: 1px solid #2e2e3a
border-radius: 14px (standard) / 16px (large)
padding: 24px (standard) / 28px 32px (section)
```

### Input / Textarea / Select
```
background: #13131a
border: 1px solid #3a3a4a
border-radius: 7–8px
padding: 10px 14px
color: #f3f4f6
font-size: 14px
outline: none
font-family: inherit
box-sizing: border-box
```

### Primary Button
```
background: linear-gradient(135deg, #8b2fe8, #7c3aed)
color: #fff
border: none
border-radius: 8px
font-weight: 700
font-size: 15px (default) / 16px (large)
padding: 10px 20px (default) / 16px 40px (large)
box-shadow: 0 4px 14px rgba(139,47,232,0.4)
font-family: inherit
cursor: pointer
```

### Ghost / Outline Button
```
background: transparent
border: 1px solid #3a3a4a
color: #a0a8b8
border-radius: 6–8px
font-size: 12–13px
```

### Destructive Button
```
background: transparent
border: 1px solid rgba(239,68,68,0.4)
color: #fca5a5
```

### Disabled State
```
background: #2e2e3a
color: #4b5563
box-shadow: none
cursor: not-allowed
```

### Status Badge (Active / Sold / Inactive)
```
display: inline-flex
align-items: center
padding: 4px 12px
border-radius: 20px
font-size: 12px
font-weight: 600
letter-spacing: 0.3px
text-transform: uppercase
```
See semantic color table for per-status values.

### Property Type Badge
```
background: rgba(168,85,247,0.10)
border: 1px solid rgba(168,85,247,0.25)
color: #c084fc
border-radius: 20px
font-size: 12px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.5px
```

### Form Label
```
display: block
font-size: 12px
font-weight: 600
color: #d1d5db
text-transform: uppercase
letter-spacing: 0.5px
margin-bottom: 6px
```

### Section Eyebrow (above section headline)
```
font-size: 12px
font-weight: 600
color: #a855f7
letter-spacing: 1px
text-transform: uppercase
margin-bottom: 12px
```

### Sticky Nav
```
position: sticky; top: 0; z-index: 100
background: rgba(15,15,20,0.85)
backdrop-filter: blur(12px)
border-bottom: 1px solid rgba(46,46,58,0.6)
height: 60px
```

### Modal Overlay
```
position: fixed; inset: 0; z-index: 1000
background: rgba(0,0,0,0.7)
backdrop-filter: blur(4px)
```

---

## Animations

Defined in `src/index.css`:

| Name | Effect | Usage |
|---|---|---|
| `pulse-glow` | opacity 1→0.4→1, 1.8s ease-in-out infinite | `.generating-pulse` on the AI loading spinner |
| `progress-bar` | width 0%→90%, 14s cubic-bezier ease-out | `.progress-bar-fill` during content generation |

---

## Responsive Breakpoints

Defined via CSS classes in `src/index.css` (used with `className` alongside inline styles):

| Breakpoint | Behavior |
|---|---|
| `≤860px` | Feature grid → 2 columns; Steps row → 1 column (gap: 16px); Step arrows hidden |
| `≤560px` | Feature grid → 1 column; Hero headline → 42px; Section headlines → 30px; Problem card padding reduced; CTA headline → 28px |

---

## File Structure Notes

- All styles are **inline** using `Record<string, React.CSSProperties>` — no CSS modules, no Tailwind
- Responsive overrides that can't be done inline use **CSS class names** in `src/index.css`
- Style objects live at the **bottom of each page/component file**
- The `AppFooter` and `PaywallBanner` components are the only shared UI components with their own style objects
- `EditListingModal` is the reusable modal pattern — study it for modal implementation reference
