# Material 3 guide for jimmypark.net

This folder is the site's reference library for **Material Design 3** (M3,
https://m3.material.io), the system the site has followed since v0.17.0. Each guide has four parts:

1. **M3 guidance**: the spec values and rules, summarised from Google's guidelines.
2. **On jimmypark.net**: the tokens, classes and files that apply it here.
3. **Do / Don't**.
4. **Checklist**.

The guides are for anyone (person or agent) editing this site. They are Markdown only and never
served: middleware returns 404 for every `.md` path.

## Precedence
1. [CLAUDE.md](../CLAUDE.md): owner rules and the release history.
2. [design.md](../design.md): **the contract** for this site (tokens, components, breakpoints, motion).
3. This folder: the M3 background and options. When it differs from design.md, design.md wins
   until the owner approves a change, and the difference is written into design.md.

Fixed by the owner, whatever M3 offers: **the colours stay the current palette** (burgundy, warm
neutrals, Scouting purple, mapped onto M3 roles); the font is **Google Sans Flex** with Pretendard
for Korean glyphs; icons are **Material Symbols Outlined**. The `/saju` app keeps its own design.

## Index
### Foundations and styles
| Guide | Covers |
|-------|--------|
| [01-color.md](01-color.md) | Colour roles, tones, our role mapping, contrast |
| [02-typography.md](02-typography.md) | The 15-style type scale, emphasized styles, our heading/body/label mapping |
| [03-shape.md](03-shape.md) | Corner radius scale, Expressive shapes, our radius tokens |
| [04-elevation.md](04-elevation.md) | Levels 0–5, tonal vs shadow, our three shadow tokens |
| [05-motion.md](05-motion.md) | Easing and duration tokens, transition patterns, Expressive springs, our motion system |
| [06-layout.md](06-layout.md) | Window size classes, margins, 4dp grid, touch targets, our breakpoints |
| [07-interaction-states.md](07-interaction-states.md) | State layers, focus, ripple, selected, disabled |
| [08-icons.md](08-icons.md) | Material Symbols axes, sizes, our icon set |
| [09-accessibility.md](09-accessibility.md) | Contrast, targets, structure, motion, our current status |

### Components
| Guide | Covers | Used on the site |
|-------|--------|------------------|
| [components/buttons.md](components/buttons.md) | Common buttons, Expressive sizes and groups, icon buttons, FAB, segmented buttons | Filled, outlined, text, icon buttons |
| [components/cards.md](components/cards.md) | Elevated, filled, outlined cards | Outlined cards, feature cards, showcases, panels |
| [components/chips.md](components/chips.md) | Assist, filter, input, suggestion chips | Static label chips |
| [components/navigation.md](components/navigation.md) | Top app bar, navigation drawer, bar, rail, tabs | Small top app bar, modal drawer |
| [components/dialogs-and-sheets.md](components/dialogs-and-sheets.md) | Dialogs, bottom and side sheets | Gallery dialog |
| [components/feedback.md](components/feedback.md) | Snackbar, progress, tooltips, badges | Copy snackbar, scroll progress |
| [components/lists-and-dividers.md](components/lists-and-dividers.md) | Lists, dividers, expandable rows | Snapshot, timeline, back-end lists, disclosures |
| [components/carousel.md](components/carousel.md) | Carousel layouts | Phone swipe rows |
| [components/inputs.md](components/inputs.md) | Text fields, search, menus, checkbox, radio, switch | Admin only |

[review-checklist.md](review-checklist.md) is a one-page check to run before shipping a page change.

## M3 Expressive: what changed (2025–2026)
M3 Expressive added button sizes XS–XL, button groups and split buttons, flexible app bars, a
collapsed/expanded navigation rail, emphasized type styles, extra shape steps (20/32/48dp), shape
morphing and **spring-based motion**. M3 now marks several baseline components **"no longer
recommended"**: the navigation drawer (→ expanded navigation rail), segmented buttons
(→ connected button group), the 80dp navigation bar and rail, baseline medium/large app bars and
the small FAB. This site still uses a modal navigation drawer — the reason is in
[components/navigation.md](components/navigation.md). May 2026 added an 8dp spacing-token scale
([06-layout.md](06-layout.md)).

## Sources and currency
- Values checked on 2026-09-19 against m3.material.io (rendered pages and token tables), Material
  Web 2.5.0 tokens (spec v0.192), Jetpack Compose Material 3 tokens and Google Fonts. The fact
  sheet with a source for every value, the conflicts between sources and the unverified items is
  [sources.md](sources.md). Where sources disagree, the guides say so.
- M3 keeps changing; recheck a value in sources.md (and on m3.material.io) before relying on it
  for a new component.
- The guides summarise Google's guidance in our own words and cite the pages; they don't copy it.
