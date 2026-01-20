# ePluris Design Language — "90s Government Retro Press Room"

Purpose: give the app authority, clarity, and the feel of printed federal briefing materials.

Principles (non-negotiable)
- **Color**: Deep Navy `#0B1F3A`, Federal Red `#B22234`, Paper `#F7F7F5`, Gray `#6B7280`.
- **Typography**: two fonts max. Headers: serif (Libre Baskerville / Georgia). Body/data: system sans.
- **Layout**: rectangular, left-aligned, hard edges. No shadows, no gradients, no rounded corners for primary controls.

Search Experience
- Label above input: `SEARCH U.S. PUBLIC RECORDS` (all caps).
- Use `.epluris-search-label` for the label and `.epluris-search-bar` for the input.

Record Briefings (results)
- Use `.record-briefing` as the container.
- Title: `.record-title` (serif, bold).
- Meta line: `.record-meta` (ALL CAPS: RECORD KIND | DATE | JURISDICTION).
- Source line: `.record-source` (preceded by separator `.epluris-separator`).

Buttons
- Use `.epluris-btn` for primary actions like `SAVE TO VAULT`.
- Rectangular, solid border, uppercase.

Vault
- Treat as a filing cabinet: label as `Vault`, items are `Saved Records` with `Filed On` and `Source` columns.

Tone & Copy
- Use neutral, formal language: `Search Results`, `No records matched the query`, `Vault`.

How to apply
1. Import `styles/epluris.css` (already added to `styles/globals.css`).
2. Replace search label with `SEARCH U.S. PUBLIC RECORDS` and apply `.epluris-search-label` + `.epluris-search-bar`.
3. Wrap result items with `.record-briefing` and use `.record-title`, `.record-meta`, `.record-source`.

Later features that align well: redactions, annotations, timelines, evidence boards.
