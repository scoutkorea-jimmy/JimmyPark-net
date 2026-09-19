<!-- Compiled 2026-09-19 for the jimmypark.net M3 guides. Values and one-line notes only, each with its source; Google's prose is not copied. Recheck before relying on a value for a new component. -->

# Material Design 3 — verified fact sheet

Checked on 2026-09-19. The values come from the primary sources listed below. Anything marked `UNVERIFIED` has no primary source in this sheet.
Units: dp in the spec equals CSS px on the web (1dp = 1 CSS px at 1×). Type sizes are sp/pt in the spec. On the web, use px or rem (16px = 1rem).

## Source key
| Key | Source (exact location) |
|---|---|
| **M3:`path`** | `https://m3.material.io/<path>`, rendered 2026-09-19 in headless Chrome. The token-viewer values were read from the page tables. Component tables use the "Default, Light" context unless stated otherwise. The site is client-rendered, so a plain fetch returns an empty shell. |
| **MW** | Material Web `@material/web@2.5.0` (npm, published 2026-07-15), generated tokens `tokens/versions/v0_192/<file>` ("Google Material 3 v0.192, 3P, Web"). Mirror: https://github.com/material-components/material-web/tree/main/tokens/versions/v0_192 and https://cdn.jsdelivr.net/npm/@material/web@2.5.0/tokens/versions/v0_192/ |
| **MW-top** | The same package, hand-maintained overrides in `tokens/<file>` (for example, button padding) |
| **CMP** | androidx `androidx-main` (the tokens folder was last changed 2026-08-05, commit 1608250). Path: `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/<File>.kt` at https://github.com/androidx/androidx. Each file carries its own `// VERSION` header. |
| **MDC** | material-components-android `master`: `docs/theming/{Motion,Shape,Typography}.md` |
| **MCU** | material-color-utilities `main`: `typescript/dynamiccolor/color_spec_2021.ts` |
| **GF** | Google Fonts CSS2 API axis-range probes (HTTP 200 inside the range, 400 one step outside it) plus `https://fonts.google.com/metadata/fonts` |

---

## A. Type scale

### A1. Baseline 15 styles (Roboto baseline)
The sizes, line heights and weights match across MW, CMP, MDC and M3. Only the tracking differs; see the notes after the table.

| Role | Size | Line height | Weight | Tracking (MW, px) | Tracking (CMP, sp) | Font token |
|---|---|---|---|---|---|---|
| display-large | 57 | 64 | 400 | −0.25 | −0.2 | brand |
| display-medium | 45 | 52 | 400 | 0 | 0 | brand |
| display-small | 36 | 44 | 400 | 0 | 0 | brand |
| headline-large | 32 | 40 | 400 | 0 | 0 | brand |
| headline-medium | 28 | 36 | 400 | 0 | 0 | brand |
| headline-small | 24 | 32 | 400 | 0 | 0 | brand |
| title-large | 22 | 28 | 400 | 0 | 0 | brand |
| title-medium | 16 | 24 | 500 | 0.15 | 0.2 | plain |
| title-small | 14 | 20 | 500 | 0.1 | 0.1 | plain |
| body-large | 16 | 24 | 400 | 0.5 | 0.5 | plain |
| body-medium | 14 | 20 | 400 | 0.25 | 0.2 | plain |
| body-small | 12 | 16 | 400 | 0.4 | 0.4 | plain |
| label-large | 14 | 20 | 500 | 0.1 | 0.1 | plain |
| label-medium | 12 | 16 | 500 | 0.5 | 0.5 | plain |
| label-small | 11 | 16 | 500 | 0.5 | 0.5 | plain |

Sources:
- **MW:** `_md-sys-typescale.scss` lines 25–284, stored as rem (for example, display-large is 3.5625rem/4rem with tracking −0.015625rem).
- **MW:** `_md-ref-typeface.scss` lines 17–21 set brand and plain to `Roboto` and the weights to 400, 500 and 700.
- **CMP:** `TypeScaleTokens.kt` lines 24–246 (VERSION v0_103). `TypefaceTokens` sets Brand and Plain to SansSerif.
- **MDC:** `Typography.md` line 27 (Display Large, Regular 57sp).
- **M3 component token tables** use the same Roboto tracking as MW. Examples:
  - Title-medium is 0.15pt: `components/extended-fab/specs`, Small label.
  - Body-medium is 0.25pt: `components/dialogs/specs`, supporting text.
  - Label-small is 0.5pt: `components/badges/specs`.
- **M3:`styles/typography/type-scale-tokens`** says: "Roboto is the default for both typefaces."

### A2. Emphasized styles (M3 Expressive)
These exist: M3 says "15 baseline and 15 emphasized". The token prefix is `md.sys.typescale.emphasized.*`. The emphasized styles have the same size and line height as baseline and a higher weight.

| Emphasized role | Weight (baseline→emph) | Source |
|---|---|---|
| display L/M/S, headline L/M/S, title-large | 400 → 500 | CMP `TypeScaleTokens.kt` lines 250+; MDC `Typography.md` lines 50–56; M3 type-scale token viewer |
| title-medium, title-small | 500 → 700 | same |
| body L/M/S | 400 → 500 | same (MDC lines 59–61) |
| label L/M/S | 500 → 700 | same (MDC lines 62–64) |

- CMP emphasized tracking: body-large 0.15, body-medium 0.25, body-small 0.4, title-medium 0.15, label/title-small 0.1. All other emphasized styles have tracking 0.
- Components do not use emphasized styles by default. M3 suggests them for badges, primary-action buttons, extended FABs, and selected list or menu items (M3:`styles/typography/type-scale-tokens`).
- Variable-font tokens: M3 lists "Variable brand/plain typeface" and variable wght tokens 400/500/600/700, plus `ROND` 0 for emphasized. In the default token-viewer context these read "Google Sans Flex". In the language-height context they read "Roboto Flex" (M3:`styles/typography/type-scale-tokens`).
- **GF:** Google Sans Flex axes are wght 1–1000, opsz 6–144, wdth 25–151, slnt −10–0, GRAD 0–100, ROND 0–100.
- Language line-height support (M3): small is the base. Medium is about 7% taller and covers Korean, CJK, Vietnamese and others. Large is about 30% taller, and extra large about 100% taller.

---

## B. Shape: corner radius scale
| Token | Value | Sources |
|---|---|---|
| corner-none | 0 | M3:`styles/shape/corner-radius-scale`; MW `_md-sys-shape.scss:30`; CMP `ShapeTokens.kt:71,80` |
| corner-extra-small | 4dp (plus `-top` = 4 4 0 0) | M3; MW :20–22; CMP :38,76 |
| corner-small | 8dp | M3; MW :31; CMP :72,81 |
| corner-medium | 12dp | M3; MW :29; CMP :70,79 |
| corner-large | 16dp (plus `-top`, `-start` = 16 0 0 16, `-end` = 0 16 16 0) | M3; MW :24–28; CMP :47–63,77 |
| corner-large-increased | 20dp | M3; CMP :55,78; MDC `Shape.md:63`. Not present in MW v0.192 |
| corner-extra-large | 28dp (plus `-top` = 28 28 0 0) | M3; MW :17–19; CMP :29,74 |
| corner-extra-large-increased | 32dp | M3; CMP :30,75; MDC :65. Not present in MW |
| corner-extra-extra-large | 48dp | M3; CMP :28,73; MDC :66. Not present in MW |
| corner-full | fully rounded (MW `9999px`; CMP `CircleShape`) | M3; MW :23; CMP :46 |

- M3 calls this a "ten-level shape scale". Symmetric and asymmetric shapes use the same scale.
- M3 gives an optical-roundness rule for nested shapes: inner radius = outer radius − padding (M3:`styles/shape/corner-radius-scale`).

---

## C. Elevation
| Level | dp | Components resting at this level (M3:`styles/elevation/tokens`, table "Component elevation") |
|---|---|---|
| 0 | 0 | app bar (not scrolled); filled, tonal and outlined buttons; button groups; filled and outlined cards; carousel; chips; full-screen dialog; FAB and extended FAB in a nav rail; FAB menu items; icon buttons; lists; nav rail; segmented button; docked side sheet; slider; split button; tabs |
| 1 | 1 | banner; modal bottom sheet; elevated button; elevated card; elevated chips; modal navigation drawer; modal side sheet |
| 2 | 3 | scrolled app bar; menu; navigation bar; rich tooltip; toolbar |
| 3 | 6 | date pickers; modal dialogs; extended FAB; FAB; FAB menu close button; search; time pickers |
| 4 | 8 | not a resting level (hover and drag only) |
| 5 | 12 | not a resting level |

dp sources: MW `_md-sys-elevation.scss:17–22`, CMP `ElevationTokens.kt:24–40` (v0_103) and the M3 table.

- M3 (`styles/elevation/applying-elevation`): resting states use levels 0 to +3. Levels +4 and +5 are reserved for user interaction such as hover and drag. Hover or focus usually raises an element one level.
- M3 (`styles/elevation/tokens`): "Surface tint color is deprecated. Use elevation level tokens (0–5) instead."
- Scrim: the `scrim` colour role at **32%** opacity. Sources: M3:`styles/elevation/applying-elevation`; CMP `ScrimTokens.kt` `ContainerOpacity = 0.32f`.
- Shadow recipe for CSS, from MW `elevation/internal/_elevation.scss`:
  - Key shadow: `0 1px 2px 0`, `0 1px 2px 0`, `0 1px 3px 0`, `0 2px 3px 0`, `0 4px 4px 0` for levels 1–5, at opacity 0.3 (lines 65–69, 105).
  - Ambient shadow: `0 1px 3px 1px`, `0 2px 6px 2px`, `0 4px 8px 3px`, `0 6px 10px 4px`, `0 8px 12px 6px`, at opacity 0.15 (lines 111–115, 174).
  - Colour: `shadow`, which is #000000.

---

## D. States
| Item | Value | Source |
|---|---|---|
| Hover state layer | 0.08 | M3:`foundations/interaction/states/state-layers` ("Hover +8%"); MW `_md-sys-state.scss:19`; CMP `StateTokens.kt:24` |
| Focus state layer | **0.10** (M3, CMP v0_210) vs **0.12** (MW v0.192) | M3 ("Focus +10%"); CMP :23; MW :18 |
| Pressed state layer | **0.10** (M3, CMP) vs **0.12** (MW) | M3 ("Press +10%"); CMP :25; MW :20 |
| Dragged state layer | 0.16 | M3; MW :17; CMP :22 |
| "Disabled state layer opacity" (sys token) | 0.38 | M3 state-layers token table |
| Disabled content (label, icon) | 0.38 of on-surface | MW component tokens (e.g. filled button `disabled-label-text-opacity`); M3 button tokens |
| Disabled container | **0.12** of on-surface (baseline) vs **0.10** (Expressive buttons) | MW `_md-comp-filled-button.scss`; M3 `[Deprecated] Button` tables show 0.12; M3 current button colour tokens show 0.1; CMP `FilledButtonTokens` (v0_11_0) 0.1f vs `FilledTonalButtonTokens` (v0_103) 0.12f |
| Disabled card | container 0.38; outlined-card outline 0.12 | M3:`components/cards/specs`; MW |
| State layer size / touch target | 40dp layer, 48dp target | M3 state-layers page |
| State layer colour | the content ("on") colour of the element | M3 state-layers page |
| Focus indicator | thickness **3dp**, outward offset **2dp**, colour `secondary` (#625B71) | M3 token tables (buttons, cards, chips, bottom sheet); MW-top `_md-comp-focus-ring.scss:46–52` (width 3px, outward-offset 2px, inward-offset 0, shape full, colour secondary, duration long4, active-width 8px) |
| Inward focus offset | **−3dp** for list items, nav bar, nav drawer, menu items and primary tabs | M3 token tables on those spec pages |

- Disabled states do not need to meet contrast requirements.
- Disabled components do not show hover, focus or pressed states.
- Only one hover, one focus and one pressed state can exist at a time.

Source for these three points: M3:`foundations/interaction/states/applying-states`.

---

## E. Motion

### E1. Easing (cubic-bezier)
| Token | Value | Source |
|---|---|---|
| standard | `cubic-bezier(0.2, 0, 0, 1)` | M3:`styles/motion/easing-and-duration/tokens-specs` (CSS row); MW `_md-sys-motion.scss:47`; CMP `MotionTokens.kt:61` |
| standard-decelerate | `cubic-bezier(0, 0, 0, 1)` | M3; MW :51; CMP :67 |
| standard-accelerate | `cubic-bezier(0.3, 0, 1, 1)` | M3; MW :49; CMP :64 |
| emphasized | path `M 0,0 C 0.05,0 0.133333,0.06 0.166666,0.4 C 0.208333,0.82 0.25,1 1,1`. M3 says CSS "N/A (use Standard as a fallback)"; MW and CMP use `cubic-bezier(0.2, 0, 0, 1)` | M3; MW :33; CMP :40 |
| emphasized-decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | M3; MW :37; CMP :46 |
| emphasized-accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | M3; MW :35; CMP :43 |
| legacy | `cubic-bezier(0.4, 0, 0.2, 1)` | MW :39; CMP :49. The M3 page lists it by name only, with no CSS row |
| legacy-accelerate | `cubic-bezier(0.4, 0, 1, 1)` | MW :41; CMP :52 |
| legacy-decelerate | `cubic-bezier(0, 0, 0.2, 1)` | MW :43; CMP :55 |
| linear | `cubic-bezier(0, 0, 1, 1)` | MW :45; CMP :58 |

### E2. Durations (ms)
The values are identical in M3 (tokens-specs page), MW `_md-sys-motion.scss:17–32` and CMP `MotionTokens.kt:24–39`.

| Group | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| short | 50 | 100 | 150 | 200 |
| medium | 250 | 300 | 350 | 400 |
| long | 450 | 500 | 550 | 600 |
| extra-long | 700 | 800 | 900 | 1000 |

Suggested pairs (M3:`styles/motion/easing-and-duration/applying-easing-and-duration`):

| Transition | Emphasized set | Standard set |
|---|---|---|
| Begin and end on screen | emphasized, 500 | standard, 300 |
| Enter the screen | emphasized-decelerate, 400 | standard-decelerate, 250 |
| Exit the screen | emphasized-accelerate, 200 | standard-accelerate, 200 |

M3 note: "In the expressive update, components and motion now use the motion physics system … The easing and duration system is still used for transitions … but is no longer maintained."

### E3. Motion physics (springs, M3 Expressive)
Token form: `md.sys.motion.spring.{fast|default|slow}.{spatial|effects}`. The scheme (expressive or standard) is chosen at product level (M3:`styles/motion/overview/how-it-works`).

| Spring | Expressive damping / stiffness | Standard damping / stiffness | Web curve (M3), Expressive | Web curve (M3), Standard |
|---|---|---|---|---|
| fast spatial | 0.6 / 800 | 0.9 / 1400 | `cubic-bezier(0.42, 1.67, 0.21, 0.90)` 350ms | `(0.27, 1.06, 0.18, 1.00)` 350ms |
| default spatial | 0.8 / 380 | 0.9 / 700 | `(0.38, 1.21, 0.22, 1.00)` 500ms | `(0.27, 1.06, 0.18, 1.00)` 500ms |
| slow spatial | 0.8 / 200 | 0.9 / 300 | `(0.39, 1.29, 0.35, 0.98)` 650ms | `(0.27, 1.06, 0.18, 1.00)` 750ms |
| fast effects | 1 / 3800 | 1 / 3800 | `(0.31, 0.94, 0.34, 1.00)` 150ms | same |
| default effects | 1 / 1600 | 1 / 1600 | `(0.34, 0.80, 0.34, 1.00)` 200ms | same |
| slow effects | 1 / 800 | 1 / 800 | `(0.34, 0.88, 0.34, 1.00)` 300ms | same |

Sources:
- **M3:`styles/motion/overview/specs`:** the token viewer in the "Expressive, Web" and "Standard, Android" contexts, and the table "Web: Convert springs to curves".
- **CMP:** `ExpressiveMotionTokens.kt:22–33` and `StandardMotionTokens.kt:20–31` (v0_14_0).
- **MDC:** `Motion.md:63–68` (the Standard values).

Usage rules:
- Spatial springs move things: position, size, rotation and corner radius. They overshoot.
- Effects springs change colour and opacity, with no overshoot.
- Speed: fast for small components (buttons, switches), default for partial-screen motion, slow for full-screen motion.
- M3 says "All component motion is driven by two tokens: expressive fast spatial and expressive fast effects".
- Buttons: shape-morph spring 0.9/1400 in M3 button size tokens.

Sources: M3:`styles/motion/overview/how-it-works`; M3:`components/buttons/specs`.

---

## F. Layout

### F1. Breakpoints ("window size classes" was renamed "breakpoints")
Page: M3:`foundations/layout/breakpoints/overview` (the old `/applying-layout/window-size-classes` redirects here).

| Class | Width (dp) | Panes | Margins | Spacer | Navigation | Source |
|---|---|---|---|---|---|---|
| compact | < 600 | 1 | **16** | n/a | nav bar or modal expanded rail | M3 `…/breakpoints/compact` |
| medium | 600–839 | 1 (recommended) or 2 (50/50) | **24** | **24** | rail (1 pane) or nav bar (2 panes) | M3 `…/breakpoints/medium` |
| expanded | 840–1199 | 1 or 2 (recommended) | **24** | **24** | collapsed or expanded rail | M3 `…/breakpoints/expanded` |
| large | 1200–1599 | 2 (recommended) | **24** | **24** | collapsed or expanded rail | M3 `…/breakpoints/large-extra-large` |
| extra-large | ≥ 1600 | 1–3 | **24** | **24** | expanded rail; a standard side sheet can be the 3rd pane | same |

- Fixed pane widths: 360dp by default at expanded, 412dp at large and extra-large. Side sheets are 400dp max. Split panes keep the spacer centred (M3).
- androidx `window-core` `WindowSizeClass.kt:146–155` matches: WIDTH lower bounds 600, 840, 1200, 1600.
- Height breakpoints are 480 and 900 (lines 158–161). The M3 page says height classes exist on Android but gives no numbers.
- Line length: "keep text between 40–60 characters per line" at every breakpoint (M3 breakpoints overview).

### F2. Spacing grid
- The current system is an **8dp scale**, `md.sys.measurement.space100 = 8dp`. Material also defines nested units of 2, 4, 6 and 10dp (M3:`styles/spacing/tokens`). The page says: "The spacing system tokens are only used on Jetpack Compose".

| Token | Value | Token | Value |
|---|---|---|---|
| space0 | 0 | space300 | 24 |
| space25 | 2 | space400 | 32 |
| space50 | 4 | space450 | 36 |
| space75 | 6 | space500 | 40 |
| space100 | 8 | space600 | 48 |
| space125 | 10 | space700 | 56 |
| space150 | 12 | space800 | 64 |
| space175 | 14 | space900 | 72 |
| space200 | 16 | | |
| space250 | 20 | | |

- Spacing has three categories: padding, gaps and margins. New component attribute names use padding, margin and gap (M3:`m3/pages/spacing/overview`). The spacing system was announced at I/O on 19 May 2026 (M3:`blog/whats-new-at-io26`).
- Density: a denser step usually removes 4dp from the top and bottom padding or the height. Density must not make targets smaller than 48×48 (M3:`foundations/layout/grids-spacing/density`).

### F3. Targets
- Touch targets at least **48×48dp** (about 9mm). Pointer targets at least **44×44dp**. Keep **8dp** or more between targets (M3:`foundations/designing/structure`, section "Target sizes").
- Example: a 24dp icon inside a 40dp state layer inside a 48dp target (same page and the state-layers page).

---

## G. Colour roles (baseline static scheme, light)
Hex values: M3:`styles/color/static/baseline` token viewer ("Default, Light").
Tones: CMP `ColorLightTokens.kt:22–165` (v0_210) and MW `_md-sys-color.scss:82–134`. Palette hex values: CMP `PaletteTokens.kt`.

| Role | Hex (M3) | Tone | Role | Hex (M3) | Tone |
|---|---|---|---|---|---|
| primary | #6750A4 | P40 | on-primary | #FFFFFF | P100 |
| primary-container | #EADDFF | P90 | on-primary-container | **#4F378B** | **P30 (M3) / P10 #21005D (MW, CMP)** |
| secondary | #625B71 | S40 | on-secondary | #FFFFFF | S100 |
| secondary-container | #E8DEF8 | S90 | on-secondary-container | **#4A4458** | **S30 (M3) / S10 (MW, CMP)** |
| tertiary | #7D5260 | T40 | on-tertiary | #FFFFFF | T100 |
| tertiary-container | #FFD8E4 | T90 | on-tertiary-container | **#633B48** | **T30 (M3) / T10 (MW, CMP)** |
| error | #B3261E | E40 | on-error | #FFFFFF | E100 |
| error-container | #F9DEDC | E90 | on-error-container | **#8C1D18** | **E30 (M3) / E10 (MW, CMP)** |
| surface | #FEF7FF | N98 | on-surface | #1D1B20 | N10 |
| surface-dim | #DED8E1 | N87 | surface-bright | #FEF7FF | N98 |
| surface-container-lowest | #FFFFFF | N100 | surface-container-low | #F7F2FA | N96 |
| surface-container | #F3EDF7 | N94 | surface-container-high | #ECE6F0 | N92 |
| surface-container-highest | #E6E0E9 | N90 | on-surface-variant | #49454F | NV30 |
| surface-variant (legacy) | #E7E0EC | NV90 | background / on-background (legacy) | #FEF7FF / #1D1B20 | N98 / N10 |
| outline | #79747E | NV50 | outline-variant | #CAC4D0 | NV80 |
| inverse-surface | #322F35 | N20 | inverse-on-surface | #F5EFF7 | N95 |
| inverse-primary | #D0BCFF | P80 | surface-tint (deprecated) | #6750A4 | = primary |
| scrim | #000000 | N0 | shadow | #000000 | N0 |
| primary-fixed | #EADDFF | P90 | primary-fixed-dim | #D0BCFF | P80 |
| on-primary-fixed | #21005D | P10 | on-primary-fixed-variant | #4F378B | P30 |
| secondary-fixed | #E8DEF8 | S90 | secondary-fixed-dim | #CCC2DC | S80 |
| on-secondary-fixed | #1D192B | S10 | on-secondary-fixed-variant | #4A4458 | S30 |
| tertiary-fixed | #FFD8E4 | T90 | tertiary-fixed-dim | #EFB8C8 | T80 |
| on-tertiary-fixed | #31111D | T10 | on-tertiary-fixed-variant | #633B48 | T30 |

- M3 names **26 standard roles** in six groups: primary, secondary, tertiary, error, surface and outline. Fixed, fixed-dim, surface-dim and surface-bright are add-on roles (M3:`styles/color/roles`).
- MCU `color_spec_2021.ts` `onPrimaryContainer()` returns tone `isDark ? 90 : 30` for non-fidelity, non-monochrome schemes. This supports M3's tone-30 values.
- Contrast guidance:
  - Colour roles pair to at least **3:1** (M3:`styles/color/roles`).
  - Medium contrast has a 3:1 minimum and high contrast targets **7:1** (M3:`styles/color/system/how-the-system-works`).
  - Text needs **4.5:1**. Large text (≥ 14pt bold or 18pt regular) and graphics need **3:1**.
  - Grouped non-text elements, such as button containers, need 3:1 against the background. Standalone elements such as a FAB are exempt.
  - Disabled states are exempt.
  - Sources for these three points: M3:`foundations/designing/color-contrast`.
  - `outline-variant` is for decorative lines such as dividers. For target boundaries use `outline` or another colour with 3:1 (M3 roles).

---

## H. Component specs
**Type role key:** LL = label-large 14/20 500; LM = label-medium 12/16 500; LS = label-small 11/16 500; BL = body-large 16/24; BM = body-medium 14/20; BS = body-small 12/16; TM = title-medium 16/24 500; TL = title-large 22/28; HS = headline-small 24/32; HM = headline-medium 28/36; DS = display-small 36/44.

**Elevation key:** `L0`–`L5` are the levels in section C.

In the tables below, **Exp.** marks M3 Expressive values; **baseline** marks the pre-Expressive M3 values.

### Common buttons
| | Baseline (all 5 styles) | Exp. XS | Exp. S (default) | Exp. M | Exp. L | Exp. XL |
|---|---|---|---|---|---|---|
| Height | 40 | 32 | 40 | 56 | 96 | 136 |
| Round shape / square shape | full / n/a | full / 12 | full / 12 | full / 16 | full / 28 | full / 28 |
| Pressed-morph radius | n/a | 8 | 8 | 12 | 16 | 16 |
| Leading / trailing padding | 24 (16 on the icon side); text button 12 (16 on the non-icon side) | 12 | 16 | 24 | 48 | 64 |
| Icon size / icon-label gap | 18 / 8 | 20 / 4 | 20 / 8 | 24 / 8 | 32 / 12 | 40 / 16 |
| Label | LL | LL | LL | TM | HS | headline-large 32/40 |
| Outline width (outlined) | 1 | 1 | 1 | 1 | 2 | 3 |

Sources:
- **Baseline:** MW `_md-comp-{filled,elevated,filled-tonal,outlined,text}-button.scss` (height 40px, shape full, icon 18px) and MW-top (padding).
- **Exp.:** M3:`components/buttons/specs` "Button - Size - *" tables and the "Corner sizes" table.
- **CMP:** `Button{XSmall,Small,Medium,Large,XLarge}Tokens.kt` (heights 32, 40, 56, 96, 136 and matching shapes). `Button.kt` `textStyleFor()` maps sizes to LL, TM, HS and headline-large.
- **Colours (default, not toggle):**
  - Elevated: surface-container-low with a primary label, L1.
  - Filled: primary with on-primary, L0.
  - Tonal: secondary-container with on-secondary-container, L0.
  - Outlined, Exp.: outline-variant border with an on-surface-variant label.
  - Outlined, baseline: outline border with a primary label (MW).
  - Text: primary.
  - Sources: M3 colour table and tokens; MW; CMP `ElevatedButtonTokens` L1.
- **M3 padding note:** for the small button, a 24dp padding is "Not recommended [in Expressive]. Use 16dp".

### Icon buttons
| | XS | S (default) | M | L | XL |
|---|---|---|---|---|---|
| Container | 32 | 40 | 56 | 96 | 136 |
| Icon | 20 | 24 | 24 | 32 | 40 |
| Default side padding (narrow / wide) | 6 (4/10) | 8 (4/14) | 16 (12/24) | 32 (16/48) | 48 (32/72) |
| Square shape | 12 | 12 | 16 | 28 | 28 |

- Round shape: full.
- Outline: 1 (L 2, XL 3).
- Colours:
  - Standard: on-surface-variant icon.
  - Filled: primary with on-primary.
  - Tonal: secondary-container with on-secondary-container.
  - Outlined: outline-variant with on-surface-variant.
- Source: M3:`components/icon-buttons/specs`.
- Baseline: 40×40 state layer, 24 icon, full shape (MW `_md-comp-icon-button.scss`).
- CMP `SmallIconButtonTokens.kt` matches the S column (VERSION 14_1_0).
- XS and S need a 48×48 target (M3 buttons specs).

### FAB and extended FAB
| | FAB (baseline "regular") | FAB medium | FAB large | FAB small (still available, not recommended) |
|---|---|---|---|---|
| Size | 56 | 80 | 96 | 40 |
| Shape | 16 (large) | 20 (large-increased) | 28 (extra-large) | 12 (medium) |
| Icon | 24 | 28 | 36 (M3) / 32 (CMP) | 24 |

| Extended FAB | Small (= baseline height) | Medium | Large | Baseline |
|---|---|---|---|---|
| Height | 56 | 80 | 96 | 56 |
| Shape | 16 | 20 | 28 | 16 |
| Padding / gap | 16 / 8 | 26 / 12 | 28 / 16 | UNVERIFIED |
| Label | TM | TL | HS | LL |
| Icon | 24 | 28 | 36 | 24 |

- Colours: "tonal primary" = primary-container with on-primary-container. Also secondary- and tertiary-container versions, and primary, secondary and tertiary fills.
- Surface FAB colours are "no longer recommended".
- Elevation: **L3** (lowered: L1).
- Sources:
  - M3:`components/floating-action-button/specs` and `/extended-fab/specs`.
  - CMP `Fab{Baseline,Small,Medium,Large}Tokens.kt` (v0_14_0), `FabPrimaryContainerTokens` L3, `ExtendedFabPrimaryTokens` (L3; lowered L1).

### Segmented buttons (M3: "no longer recommended in Expressive; use connected button group")
- Height 40; shape full; outline 1dp `outline` (#79747E).
- Selected: secondary-container with on-secondary-container. Unselected label: on-surface.
- Icon 18; label LL.
- Sources: M3:`components/segmented-buttons/specs`; CMP `OutlinedSegmentedButtonTokens.kt` (40, 1, full, 18).

### Cards
| | Elevated | Filled | Outlined |
|---|---|---|---|
| Container | surface-container-low | surface-container-highest | surface |
| Elevation | L1 | L0 | L0 |
| Border | none | none | 1dp outline-variant |

- Shape: **12dp** (medium) for all three.
- Measurements: left/right padding **16dp**; gap between cards **8dp max**.
- Sources: M3:`components/cards/specs` (tokens and measurement table); MW `_md-comp-{elevated,filled,outlined}-card.scss`; CMP `ElevatedCardTokens` L1.

### Chips (assist, filter, input, suggestion)
- Height 32; shape **8dp** (small); icon 18; label LL.
- Padding 16 left/right, 8 on the side with an icon; 8 between elements.
- Input-chip avatar 24 (full shape).
- Flat chips: outline 1dp outline-variant, L0. Elevated chips: surface-container-low, L1.
- Selected filter or input chip: secondary-container with on-secondary-container.
- Labels: assist uses on-surface; the others use on-surface-variant.
- Sources: M3:`components/chips/specs` (tokens and measurement tables); CMP `{Assist,Filter,Suggestion}ChipTokens` (L0 flat, L1 elevated).

### Top app bars
| | Small / centre-aligned | Medium (baseline) | Large (baseline) | Medium flexible (Exp.) | Large flexible (Exp.) |
|---|---|---|---|---|---|
| Height | 64 | 112 | 152 | 112 (136 with subtitle) | 120 (152 with subtitle) |
| Title | TL | HS | HM | HM | DS |

- Container: surface; on scroll, surface-container.
- Elevation L0; on scroll L2.
- Shape none.
- Left and right padding 4; icons 24; avatar 32.
- M3 says baseline medium and large are "no longer recommended in M3 Expressive".
- Sources: M3:`components/app-bars/specs`; CMP `AppBar{Small,Medium,Large,MediumFlexible,LargeFlexible}Tokens.kt`; CMP `AppBarTokens` (on-scroll elevation L2).

### Navigation drawer (M3: "no longer recommended in Expressive; use expanded navigation rail")
- Width **360**; height 100%.
- Active indicator 336 × 56, full shape, secondary-container.
- Left and right padding 28; indicator padding 12; icon 24.
- Label LL. Active label: on-secondary-container, weight 700. Inactive: on-surface-variant.
- Standard drawer: surface, L0.
- Modal drawer: surface-container-low, **L1**, shape large-end **0 16 16 0**. Bottom drawer: large-top.
- Scrim: see the conflicts list.
- Sources: M3:`components/navigation-drawer/specs`; MW `_md-comp-navigation-drawer.scss`; CMP `NavigationDrawerTokens.kt` (360, CornerLargeEnd, modal L1).

### Navigation bar
| | Flexible (Exp.) | Baseline ("no longer recommended") |
|---|---|---|
| Height | **64** | **80** |
| Active indicator (vertical item) | 56 × 32 | 64 × 32 |
| Horizontal item | indicator height 40, padding 16/16 | n/a |

- Label LM. Icon 24. Indicator full shape, secondary-container. Container surface-container.
- Level 2 in the M3 elevation table.
- Sources: M3:`components/navigation-bar/specs`; CMP `NavigationBarTokens.kt` (ContainerHeight 64, TallContainerHeight 80, L2); MW `_md-comp-navigation-bar.scss` (80px, 64×32).

### Navigation rail
- Collapsed: width **96** (narrow 80); top space 44.
- Expanded: width **220–360**.
- Item: height 64 (short 56). Vertical indicator 56 × 32; horizontal indicator height 56.
- Labels: LM vertical, LL horizontal. Icon 24.
- Container surface, L0. Modal expanded rail: surface-container, 16dp corner, CMP L2.
- Baseline rail: width 80, "no longer recommended".
- Sources: M3:`components/navigation-rail/specs`; CMP `NavigationRail{Collapsed,Expanded}Tokens.kt`.

### Dialogs
Basic dialog:
- Shape **28** (extra-large).
- Width **min 280, max 560**.
- Padding 24 on all sides.
- Gaps: title to body 16; icon to title 16; body to actions 24; between buttons 8.
- Icon 24 (secondary).
- Headline HS (on-surface). Supporting text BM (on-surface-variant). Actions LL (primary).
- Container surface-container-high, **L3**.

Full-screen dialog:
- Shape 0; header 56; bottom action bar 56; padding 24.

Sources: M3:`components/dialogs/specs`; MW `_md-comp-dialog.scss`; CMP `DialogTokens` L3.

### Snackbar
- Height **48** (one line), **68** (two lines).
- Shape 4 (extra-small).
- Container inverse-surface. Text inverse-on-surface, BM. Action inverse-primary, LL.
- Elevation L3. Icon 24.
- Sources: M3:`components/snackbar/specs` (68dp and colours); MW `_md-comp-snackbar.scss:126–128` (48px, 68px); CMP `SnackbarTokens` (48, 68, L3).

### Lists
- Item heights **56 / 72 / 88** for one, two and three lines.
- Padding: leading and trailing 16; top and bottom **10** (MW-top: 12); between elements 12.
- Leading avatar 40; icons 24 (Exp. 20); image 56.
- Label BL; supporting text BM; overline and trailing supporting text LS.
- Divider 1dp with 16dp inset.
- Expressive segmented list:
  - Gap between segments 2.
  - Items have a 4dp inner and 16dp outer radius; a selected item has 16dp on all corners.
  - The list container uses the large shape.
- Sources: M3:`components/lists/specs`; CMP `ListTokens.kt` (VERSION 29.0.0).

### Text fields (filled and outlined)
- Height **56**.
- Filled shape: extra-small-top (4 4 0 0), container surface-container-highest.
- Filled active indicator: 1dp on-surface-variant; 2dp primary when focused.
- Outlined shape 4. Outline 1dp `outline`; focused 2dp (MW, CMP) or 3dp (M3); see the conflicts list.
- Padding: top and bottom 8; left and right 16 (12 with icons); icon to text 16; supporting text top padding 4.
- Icons 24. Input and label BL; supporting text BS.
- Sources: M3:`components/text-fields/specs`; MW `_md-comp-*-text-field.scss` (focus-outline-width 2px line 78; focus active indicator 2px line 91).

### Menus
| | Baseline | Expressive ("vertical menu") |
|---|---|---|
| Container | shape 4 (extra-small), surface-container, **L2** | shape 16 (large) |
| Width | 112 min, 280 max | UNVERIFIED |
| Item height | 48 | 44 |
| Item padding | 12 left/right; 12 between elements | 16 / 16, 8 top and bottom; 12 between elements |
| Icons / label | 24 icons; label LL | 20 icons |
| Other | divider 1dp with 8dp vertical padding | gap and group padding 2 |
| Selected item | secondary-container | Standard colour: surface-container-low with a tertiary-container selected item; Vibrant: tertiary-container with a tertiary selected item |

Sources: M3:`components/menus/specs`; MW `_md-comp-menu.scss`; CMP `MenuTokens` (v0_210) L2.

### Progress indicators
- Linear: height **4**. Thick variant: track 8, active indicator 14. Wavy: amplitude 3, wavelength 40.
- Gap between track and indicator 4. Stop indicator 4. Full shape.
- Circular: **40** (48 when wavy; thick 52). Thickness 4 (thick 8).
- Colours: active indicator primary; track secondary-container.
- Source: M3:`components/progress-indicators/specs`. For older values, see the conflicts list.

### Tabs
- Height **48** with a label only, **64** with icon and label. Icon 24; label LL.
- Primary tabs: indicator **3dp**, primary colour, corner 3 3 0 0 (MW), minimum length 24, inset 2 per side.
- Secondary tabs: indicator **2dp**.
- Divider 1dp surface-variant.
- Container surface, L0.
- Sources: M3:`components/tabs/specs`; MW `_md-comp-primary-navigation-tab.scss`.

### Tooltips
- Plain: height **24**, padding 8, shape 4, inverse-surface with inverse-on-surface text, BS.
- Rich: shape 12 (medium); padding 12 top, 8 bottom, 16 left/right; surface-container; subhead LL; supporting text BM; action LL primary; **L2**.
- Sources: M3:`components/tooltips/specs`; CMP `RichTooltipTokens` L2.

### Badges
- Small badge: **6dp** dot.
- Large badge: height **16**, full shape, error with on-error text, label LS (11/16).
- Sources: M3:`components/badges/specs`; CMP `BadgeTokens.kt`.

### Dividers
- Thickness **1dp**, outline-variant.
- Inset and bottom-margin options: 16dp inset, 8dp margin.
- Sources: M3:`components/divider/specs`; MW `_md-comp-divider.scss`.

### Search
Search bar:
- Height **56**, full shape, surface-container-high.
- Padding: leading and trailing 16 (4 in the contained style with actions); icon to label 16.
- Icons 24; avatar 30; input text BL.
- Pane margin **24**, shrinking to **12 when focused** (Exp.).
- Level 3 in the M3 elevation table (CMP `SearchBarTokens` L3).

Search view:
- Docked: shape 28, header 56.
- Full-screen: shape 0, header 72.

Sources: M3:`components/search/specs`; M3:`m3/pages/spacing/overview`; MW `_md-comp-search-bar.scss:39–42`.

### Sheets
Bottom sheet:
- Shape extra-large-top (28 28 0 0); minimised shape 0.
- Drag handle 32 × 4, on-surface-variant at 0.4.
- Full width up to **640**. Wider windows get a 56 top margin and 56 side margins.
- Modal: L1.

Side sheet:
- Token docked width **256**; measurement max width **400**.
- Padding 24 at start and end; 12 between top elements.
- Bottom action area 72 high.
- Detached: 16 margins, large shape.
- Modal: large-start shape (16 0 0 16), L1.
- Headline TL.

Sources: M3:`components/bottom-sheets/specs`; M3:`components/side-sheets/specs`; MW `_md-comp-sheet-{bottom,side}.scss`.

### Carousel
- Item corner **28** (extra-large).
- Padding: leading and trailing 16; top and bottom 8; between items 8.
- Small items **40–56** wide.
- Source: M3:`components/carousel/specs`.

### Switch, checkbox, radio
- **Switch:**
  - Track 52 × 32, 2dp outline, full shape.
  - Handle: 16 unselected, 24 selected or with an icon. Icon 16.
  - State layer 40.
  - Sources: M3:`components/switch/specs`; CMP `SwitchTokens.kt` (v0_210).
- **Checkbox:**
  - Box 18, **2dp corner** (CMP `CheckboxTokens.kt`; M3 shows the shape only as an image), 2dp unselected outline.
  - Icon 18; state layer 40.
  - Source: M3:`components/checkbox/specs`.
- **Radio:**
  - Icon 20; state layer 40; target 48.
  - Sources: M3:`components/radio-button/specs`; CMP `RadioButtonTokens`.

---

## I. Icons (Material Symbols)
| Axis | Range | Guidance | Source |
|---|---|---|---|
| FILL | 0–1 | 0 = outlined, 1 = filled. Use for state changes (e.g. selected nav). | GF (range probe); M3:`styles/icons/applying-icons` |
| wght | 100–700 | 400 regular recommended. Do not go below 200 at 24dp. Do not mix weights. | GF; M3 applying-icons and designing-icons ("recommended stroke weight … 2dp or the regular weight (400)") |
| GRAD | −50–200 | 0 for dark icons on light backgrounds; −25 for light icons on dark backgrounds; positive values add emphasis. | GF; M3 applying-icons |
| opsz | 20–48 | Match the rendered size. | GF; M3 ("Optical sizes range from 20dp to 48dp") |

- Sizes: **24dp** is standard. Use **20dp** for dense desktop layouts and **40 or 48dp** for display, headline and large-screen use (M3:`styles/icons/designing-icons`).
- 24dp icon construction: 20dp live area, 2dp padding, 2dp stroke, 2dp corner radius (M3 designing-icons).
- Three styles: Outlined, Rounded and Sharp (M3:`styles/icons/overview`).
- GF range check: `opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` returns 200. Stepping one unit past any bound returns 400.

---

## UNVERIFIED, conflicting or version-dependent values

### Conflicts between sources
1. **Type font and tracking on m3.material.io.** The type-scale token viewer, which has no context selector, shows *Google Sans* and *Google Sans Text*. Its tracking is 0, or 0.1pt for body-small, label-medium and label-small.
   - The same page's text says Roboto is the default.
   - The M3 component token tables, MW and MDC all use Roboto with the section A1 tracking.
   - A second M3 viewer (the baseline nav rail) also showed Google-branded values (#C2E7FF, Google Sans Text).
   - Treat the Google Sans values as a Google-product context, not the public baseline. Sizes, line heights and weights match in every source.
2. **Compose tracking is rounded.** Display-large is −0.2 (MW −0.25), body-medium 0.2 (MW 0.25) and title-medium 0.2 (MW and the M3 component tables 0.15).
3. **Tracking of emphasized styles in a Roboto baseline is UNVERIFIED.** CMP gives non-zero values; M3 shows 0 in its Google Sans context.
4. **Focus and pressed state layers:** 0.10 in M3 and CMP (v0_210); 0.12 in MW v0.192.
5. **Disabled container opacity:** 0.12 in baseline MW, the M3 deprecated tables and older CMP files; 0.10 in the M3 Expressive button tokens and the CMP v0_11_0 button files.
6. **on-*-container tones in the light baseline:** tone 30 in M3 and MCU (e.g. #4F378B); tone 10 in the MW v0.192 and CMP static tokens (e.g. #21005D).
7. **Outlined button:** Expressive uses an outline-variant border with an on-surface-variant label (M3 current tokens). Baseline uses an outline border with a primary label (MW).
8. **XS button padding:** 12dp with a 4dp icon gap (M3) vs 16dp with 8dp (CMP `ButtonXSmallTokens`).
9. **Toggle-button selected shapes:** M3 has selected-round = medium rounding and selected-square = full. CMP `ButtonSmallTokens` names them the other way round. CMP `SmallIconButtonTokens` agrees with M3.
10. **Large FAB icon:** 36dp (M3) vs 32dp (CMP `FabLargeTokens`).
11. **Circular progress:** 40dp with a full-shape indicator (M3 current) vs 48px with shape none (MW v0.192).
12. **Focused outlined text field:** 3dp outline (M3 current table) vs 2px/2dp (MW :78, CMP `OutlinedTextFieldTokens`).
13. **Scrim:** 32% of `scrim` (#000) in the M3 elevation page and CMP `ScrimTokens`. The M3 navigation-drawer baseline table shows #322F37 (NV20) at 0.4.
14. **Side sheet width:** 256dp token vs a 400dp maximum in the measurements table (both on M3; MW has 256px).
15. **List item top and bottom padding:** 10dp (M3, CMP) vs 12px (MW-top `_md-comp-list-item.scss:139–140`).
16. **Emphasized easing in CSS:** M3 says there is no CSS equivalent (use Standard as the fallback). MW and CMP both map it to `cubic-bezier(0.2,0,0,1)`, which is identical to Standard.
17. **Superseded baseline values** that are still listed as "no longer recommended":
    - nav bar 80dp (now 64);
    - nav rail 80dp (now 96 collapsed);
    - medium and large app bars (now "flexible");
    - navigation drawer (now the expanded rail);
    - segmented buttons (now the connected button group);
    - small FAB;
    - baseline menu 4dp/48dp (Expressive: 16dp/44dp).

### UNVERIFIED (no primary number found)
- Column counts and gutters for layout grids (e.g. 4/8/12 columns). The current M3 grids pages give no counts.
- A separate "4dp baseline grid" as a named rule. The current M3 system is an 8dp scale with nested 2, 4, 6 and 10dp units.
- The padding and icon-label gap of the baseline extended FAB. The M3 baseline table gives height 56, shape 16 and label LL only.
- The width of the Expressive menu container.
- Material Symbols *default* axis values (FILL 0, wght 400, GRAD 0, opsz 24). The font's `fvar` defaults were not read. Only the ranges and M3's recommendations are verified.
- Component elevation numbers inside the M3 token viewers, which render as swatches without numbers. The levels above come from CMP, MW and the M3 elevation table.
- Numeric height-class breakpoints on m3.material.io. Only androidx gives 480 and 900.
- Springs on the web: Material Web has no spring tokens. M3 supplies only cubic-bezier approximations (section E3).
