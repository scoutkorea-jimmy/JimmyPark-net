# Inputs: text fields, search, menus, selection controls

> M3 source: https://m3.material.io/components/text-fields/specs · /components/search/specs ·
> /components/menus/specs · /components/checkbox/specs · /components/radio-button/specs ·
> /components/switch/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

Public pages have no forms (contact is mail, phone and LinkedIn). These specs apply to **Admin**
(`admin.html`, `assets/admin.js`, `assets/insights-admin.js`) and to any future public form.

## M3 guidance
| Component | Key spec |
|-----------|----------|
| Filled text field | 56 tall; `surface-container-highest`; top corners 4 (`4 4 0 0`); active indicator 1dp `on-surface-variant` → 2dp `primary` when focused |
| Outlined text field | 56 tall; corner 4; 1dp `outline` → focused 2dp (Material Web, Compose; the current M3 table says 3dp) |
| Field layout | Padding 8 top/bottom, 16 sides (12 with icons), 16 icon-to-text; 24dp icons; input and label Body Large; supporting text Body Small, 4dp above |
| Search bar | 56 tall, full shape, `surface-container-high`, 16dp side padding, 24dp icons; opens a search view (docked: 28dp corners, 56dp header; full-screen: 72dp header) |
| Menu (baseline) | `surface-container`, corner 4, level 2, width 112–280, items 48 tall, 12dp padding, Label Large |
| Menu (Expressive) | Corner 16, items 44 tall, 16dp side / 8dp vertical padding, 20dp icons |
| Checkbox | 18dp box, 2dp corner, 2dp outline, 40dp state layer, 48dp target |
| Radio button | 20dp icon, 40dp state layer, 48dp target |
| Switch | Track 52 × 32 with 2dp outline, full shape; handle 16 (off) / 24 (on or with icon); 16dp icon; 40dp state layer |

Rules: every field has a visible label (not placeholder-only); errors appear as text next to the
field (not colour alone) and use the `error` role; one column on compact windows.

## On jimmypark.net
- Admin loads `site.css`, so it inherits Google Sans Flex and the `--md-*` roles, but its inputs
  are not yet restyled to M3 text fields (e.g. the TOTP field is a large centred input). When
  Admin is next changed, move inputs to the outlined text field spec above and keep Save disabled
  until content has loaded (existing behaviour).
- Public site: none. If the owner ever approves a public enquiry form, use outlined text fields,
  a filled "Send" button and inline error text.
