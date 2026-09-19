# Lists and dividers

> M3 source: https://m3.material.io/components/lists/specs · /components/divider/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance
- **Lists** are continuous vertical groups of text or images. Item heights: one line **56**, two
  lines **72**, three lines **88**. Padding 16 at the start and end, 10 top and bottom (Material Web
  uses 12), 12 between elements. Leading avatar 40, icons 24 (Expressive 20), image 56.
- Text: label Body Large; supporting text Body Medium (`on-surface-variant`); overline and
  trailing supporting text Label Small.
- Interactive items get state layers (inward focus indicator, −3dp); selected items a
  `secondary-container` fill.
- **Expressive segmented lists**: items separated by 2dp gaps, 4dp inner and 16dp outer corners
  (a selected item rounds all corners to 16), inside a large-shape container.
- **Dividers**: 1dp `outline-variant`; options for a 16dp inset and an 8dp bottom margin. Prefer
  spacing to dividers where it is enough.

## On jimmypark.net
| Element | M3 pattern | Implementation |
|---------|------------|----------------|
| `.snapshot-list` / `.snapshot-row` | Two-column list with dividers | Label (Title Medium) + value, `outline-variant` dividers |
| `.backend-list`, `.deliverable-list` | List with a leading icon | `check_circle` in primary + Body Large text |
| `.timeline-entry` | Three-line list | Year + title + context, dividers between entries |
| `.format-details`, `.travel-details`, `.backend-details` | Expandable list item | Native `<details>`; 56px summary with `expand_more` that rotates; state layer on the summary |
| `.brief-list` (Contact "What to include") | Numbered list | Number in primary, title + supporting text |

## Do / Don't
- **Do** use native `<details>`/`<summary>` for disclosures, summary ≥ 48px tall.
- **Do** keep dividers 1px `outline-variant`.
- **Don't** hide primary content behind a disclosure on desktop (admin lists start open there).
