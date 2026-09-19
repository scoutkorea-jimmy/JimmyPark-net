# Motion

> M3 source: https://m3.material.io/styles/motion/overview · /styles/motion/easing-and-duration/tokens-specs ·
> /styles/motion/easing-and-duration/applying-easing-and-duration · /styles/motion/overview/specs (springs)
> Our contract: [design.md §8](../design.md). Motion code: end of `assets/site.css` and `site.js`.
> Values verified 2026-09-19 — see [sources.md](sources.md) §E.

## M3 guidance

Motion explains change: where something came from, where it went, what is related. It should be
quick, clear and never block reading or input.

M3 now has **two systems**:
- **Motion physics (springs)** — the M3 Expressive system (2025). Components and interactive motion use it.
- **Easing + duration tokens** — still valid for transitions, and the natural fit for CSS, but M3
  notes it is "no longer maintained".

### Easing tokens
| Token | CSS | Use |
|-------|-----|-----|
| standard | `cubic-bezier(.2, 0, 0, 1)` | Transitions that begin and end on screen (utility) |
| standard-decelerate | `cubic-bezier(0, 0, 0, 1)` | Entering (utility) |
| standard-accelerate | `cubic-bezier(.3, 0, 1, 1)` | Exiting (utility) |
| emphasized | a two-segment path; M3 gives no CSS form ("use Standard as a fallback"). Material Web and Compose use `cubic-bezier(.2, 0, 0, 1)` | Transitions that begin and end on screen (expressive) |
| emphasized-decelerate | `cubic-bezier(.05, .7, .1, 1)` | Entering the screen |
| emphasized-accelerate | `cubic-bezier(.3, 0, .8, .15)` | Leaving the screen |
| legacy / -accelerate / -decelerate | `(.4, 0, .2, 1)` / `(.4, 0, 1, 1)` / `(0, 0, .2, 1)` | Matching older Material motion only |
| linear | `cubic-bezier(0, 0, 1, 1)` | Progress, colour/opacity loops |

### Duration tokens (ms)
| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| short | 50 | 100 | 150 | 200 |
| medium | 250 | 300 | 350 | 400 |
| long | 450 | 500 | 550 | 600 |
| extra-long | 700 | 800 | 900 | 1000 |

### Suggested pairs
| Transition | Emphasized set | Standard set |
|------------|----------------|--------------|
| Begins and ends on screen | emphasized, 500ms | standard, 300ms |
| Enters the screen | emphasized-decelerate, 400ms | standard-decelerate, 250ms |
| Exits the screen | emphasized-accelerate, 200ms | standard-accelerate, 200ms |

### Motion physics — springs (M3 Expressive)
- **Spatial** springs move position, size, rotation and corner radius; they may overshoot.
- **Effects** springs change colour and opacity; they never overshoot.
- Speeds: **fast** for small components (buttons, switches), **default** for partial-screen
  motion, **slow** for full-screen motion. The scheme (**expressive** or **standard**) is chosen per
  product. "All component motion is driven by two tokens: expressive fast spatial and expressive
  fast effects."

| Spring | Expressive (damping / stiffness) | Standard | Web curve — expressive | Web curve — standard |
|--------|----------------------------------|----------|------------------------|----------------------|
| fast spatial | 0.6 / 800 | 0.9 / 1400 | `cubic-bezier(.42, 1.67, .21, .90)` 350ms | `(.27, 1.06, .18, 1)` 350ms |
| default spatial | 0.8 / 380 | 0.9 / 700 | `(.38, 1.21, .22, 1)` 500ms | `(.27, 1.06, .18, 1)` 500ms |
| slow spatial | 0.8 / 200 | 0.9 / 300 | `(.39, 1.29, .35, .98)` 650ms | `(.27, 1.06, .18, 1)` 750ms |
| fast effects | 1 / 3800 | 1 / 3800 | `(.31, .94, .34, 1)` 150ms | same |
| default effects | 1 / 1600 | 1 / 1600 | `(.34, .80, .34, 1)` 200ms | same |
| slow effects | 1 / 800 | 1 / 800 | `(.34, .88, .34, 1)` 300ms | same |

On the web M3 publishes these `cubic-bezier` + duration conversions; a true spring needs JS
(Web Animations API) or a CSS `linear()` curve sampled from the spring.

### Transition patterns
Long-standing M3 patterns (the transition-patterns page; not re-verified on 2026-09-19):
**container transform** (an element grows into its detail view), **shared axis** (moving between
related steps along x, y or z), **fade through** (switching between unrelated destinations),
**fade** (elements appearing within a screen — dialogs, menus, snackbars).

### Accessibility
Honour `prefers-reduced-motion: reduce` (remove movement, keep instant state changes). Nothing
flashes more than three times a second; long-running or looping motion must be subtle or stoppable.

## On jimmypark.net (v0.17.0–v0.17.2)

Everything is gated behind `html.motion`, which `site.js` adds only when IntersectionObserver
exists and the visitor has no reduced-motion preference. Without JS, with reduced motion and in
print, content is static and fully visible.

| Effect | M3 idea | Our implementation |
|--------|---------|--------------------|
| Scroll reveals (rise, card, zoom, wipe, slide, pop) | Enter the screen | 500ms `--md-ease-emphasized-decelerate`; grids staggered 70ms (max 6) |
| Hero entrance + portrait unmask | Enter the screen | 500–1100ms staggered keyframes, `backwards` fill |
| Card hover lift, media zoom, icon nudge | Begin and end on screen | 300ms `--md-ease-emphasized`: `translateY(-4px)`, `scale(1.05)`, `translateX(4px)` |
| State layers | Effects | 150ms `--md-ease-standard` |
| Ripple + press scale | Pressed state | 550ms ripple, `scale(.97)` |
| Modal drawer | Enter the screen | 300ms slide-in, scrim fade, links staggered 40ms |
| Disclosures / gallery dialog | Fade | 300ms expand / 400ms scale-in |
| Scroll progress, count-up numbers | — | Scroll-driven `scaleX`; 1.1s ease-out count |

Tokens in `site.css`: `--md-ease-standard`, `--md-ease-emphasized`, `--md-ease-emphasized-decelerate`,
`--md-ease-emphasized-accelerate`, `--md-duration-short` (150), `-medium` (300), `-long` (500).

**Where we differ from M3, on purpose** (owner asked for livelier, more varied motion, v0.17.0):
- Reveals run 500ms (M3's enter pair is 400ms) and the portrait unmask runs 1100ms (longer than
  extra-long4, 1000ms). Keep new motion within the tokens; don't lengthen these further.
- We use easing + duration, not springs; there is no spring solver on the site.

**Traps already hit — keep them fixed** (details in design.md §8):
1. No pre-reveal `clip-path` that hides the whole element — IntersectionObserver would never fire.
2. Load animations on containers use `animation-fill-mode: backwards` — a held transform makes the
   element a containing block for `position: fixed` children (the drawer scrim shrank to 64px).
3. Phone swipe rows and closed `<details>` never meet the viewport normally; a row reveals as one,
   and an opened disclosure shows its items at once.

## Do / Don't
- **Do** enter with decelerate, exit with accelerate, and keep exits shorter than entrances.
- **Do** gate every animation behind `.motion` (or `prefers-reduced-motion: no-preference`).
- **Do** animate `transform` and `opacity`, not layout properties.
- **Don't** hide primary content at `opacity: 0` without a JS-free, reduced-motion-free fallback.
- **Don't** exceed 1000ms for anything, or 600ms for anything the visitor waits on.

## Checklist
- [ ] Easing and duration come from the tokens above.
- [ ] Reduced motion: content complete and still.
- [ ] Reveals tested with a gradual scroll at real 1440 and 390 widths (width and height passed as
      separate arguments), including swipe rows and opened disclosures.
