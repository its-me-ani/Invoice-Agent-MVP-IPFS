# Dimensions & Merging Training Dataset

## Overview
This directory contains **60 validated training examples** and **10 negative examples** demonstrating cell merging (colspan/rowspan) and column width control in SocialCalc save format (.msc files).

## Dataset Statistics
- **Total Examples:** 60 positive + 10 negative
- **Validation Status:** ✅ 100% Valid (positive examples)
- **Negative Examples:** ✅ 100% Correctly Invalid
- **Coverage Areas:**
  - Horizontal merging (colspan)
  - Vertical merging (rowspan)
  - Combined merging (colspan + rowspan)
  - Small merges (2x1, 1x2, 2x2, 3x3)
  - Large merges (up to 12 columns/rows)
  - Complex layouts (dashboards, invoices, calendars)
  - Nested structures
  - Table headers and sidebars
  - **Column width control (Examples 51-60)**
  - **Margin management with Column A**
  - **Professional document layout starting at B2**

## Cell Merging Syntax

### Colspan (Horizontal Merge)
Merges cells horizontally across columns.

```
cell:A1:t:Text:colspan:2
cell:B1:t:
```

**Important:** All cells covered by the merge must be explicitly defined with empty content (`cell:B1:t:`)

### Rowspan (Vertical Merge)
Merges cells vertically across rows.

```
cell:A1:t:Text:rowspan:2
cell:A2:t:
```

**Important:** All cells covered by the merge must be marked empty

### Combined Merge (colspan + rowspan)
Creates a rectangular merged area.

```
cell:A1:t:Text:colspan:2:rowspan:2
cell:B1:t:
cell:A2:t:
cell:B2:t:
```

**Critical Rule:** For a merge at A1 with `colspan:2:rowspan:2`, you must mark **3 additional cells as empty**:
- B1 (right of A1)
- A2 (below A1)
- B2 (diagonal from A1)

## File Categories

### Basic Merges (1-10)
- **1.msc:** Simple 2x1 horizontal merge
- **2.msc:** Simple 1x2 vertical merge
- **3.msc:** 2x2 grid merge
- **4.msc:** 3x1 horizontal span
- **5.msc:** 1x3 vertical span
- **6.msc:** 3x3 large square merge
- **7.msc:** Header spanning 4 columns
- **8.msc:** Label spanning 4 rows
- **9.msc:** Mixed layout with horizontal and vertical merges
- **10.msc:** 2x2 merge with surrounding cells

### Table Structures (11-20)
- **11.msc:** Row with merged cells in middle
- **12.msc:** Column with merged cells in middle
- **13.msc:** 4x2 wide merge (banner area)
- **14.msc:** 2x4 tall merge (sidebar area)
- **15.msc:** 4x4 grid with four 2x2 blocks
- **16.msc:** Very wide merge (5 columns)
- **17.msc:** Very tall merge (5 rows)
- **18.msc:** Nested headers (main + sub-headers)
- **19.msc:** Vertical sections with different heights
- **20.msc:** Centered 3x3 merge with border cells

### Business Layouts (21-30)
- **21.msc:** Invoice-style header
- **22.msc:** Company header with logo
- **23.msc:** Quarterly report structure
- **24.msc:** Contact table with grouped columns
- **25.msc:** Pivot table style layout
- **26.msc:** Complex table with mixed row merges
- **27.msc:** Weekly calendar header (7 days)
- **28.msc:** Daily schedule sidebar
- **29.msc:** Dashboard with metrics section
- **30.msc:** Page layout (title, content, sidebar, footer)

### Large Merges (31-40)
- **31.msc:** Full-width banner (8 columns)
- **32.msc:** Full-height sidebar (8 rows)
- **33.msc:** Nested structure with 2x2 blocks
- **34.msc:** Report with sections and totals
- **35.msc:** Framed content layout
- **36.msc:** Maximum 4x4 merge
- **37.msc:** Header with sections and footer
- **38.msc:** Vertical sections with horizontal footer
- **39.msc:** Product table layout
- **40.msc:** Schedule grid with events

### Extra Large Merges (41-50)
- **41.msc:** Annual calendar (12 months)
- **42.msc:** Hourly schedule (12 hours)
- **43.msc:** 5x5 maximum square merge
- **44.msc:** Ultra-wide banner (10 columns)
- **45.msc:** Ultra-tall sidebar (10 rows)
- **46.msc:** Three-section layout
- **47.msc:** Side-by-side meeting rooms
- **48.msc:** Department structure
- **49.msc:** Grand report layout
- **50.msc:** Complex web page layout

### Column Width & Margin Examples (51-60)
**NEW: Professional Layout Best Practices**
- **51.msc:** Simple table with varying widths (start at B2)
- **52.msc:** Product table with wide description column
- **53.msc:** Dashboard with equal metric columns
- **54.msc:** Contact list with extra-wide email column
- **55.msc:** Invoice with wide description area
- **56.msc:** Weekly schedule with consistent day columns
- **57.msc:** Report with equal section widths
- **58.msc:** Web layout with narrow nav and wide content
- **59.msc:** Quarterly data with uniform columns
- **60.msc:** Company profile with manager name column

**Key Principles (Examples 51-60):**
- ✅ Column A reserved for margin (25-30px width)
- ✅ Content starts at cell B2 (not A1)
- ✅ Row 1 reserved for top margin
- ✅ Column widths vary based on content type
- ✅ Professional document spacing and layout

See `COLUMN-WIDTH-GUIDE.md` for detailed width recommendations.

## Negative Examples

### neg-1.msc - Invalid Attribute
**Error:** Attribute name without value
```
cell:A1:t:Text:colspan:2:invalidattr
```
**Error Message:** "Attribute 'invalidattr' missing value"

### neg-2.msc - Missing Colspan Value
**Error:** Attribute without value
```
cell:A1:t:Text:colspan
```
**Error Message:** "Attribute 'colspan' missing value"

### neg-3.msc - Double Colon
**Error:** Empty value between colons
```
cell:A1:t:Text::colspan:2
```
**Error Message:** "Attribute '2' missing value"

### neg-4.msc - Empty Colspan Value
**Error:** Empty string between colons
```
cell:A1:t:Text:colspan::2
```
**Error Message:** "Cell A1: 'colspan' must be positive integer, got ''"

### neg-5.msc - Non-numeric Colspan
**Error:** Text value instead of number
```
cell:A1:t:Text:colspan:two
```
**Error Message:** "Cell A1: 'colspan' must be positive integer, got 'two'"

### neg-6.msc - Zero Colspan
**Error:** Zero value (must be positive)
```
cell:A1:t:Text:colspan:0
```
**Error Message:** "Cell A1: 'colspan' must be positive integer, got '0'"

### neg-7.msc - Negative Rowspan
**Error:** Negative value
```
cell:A1:t:Text:rowspan:-1
```
**Error Message:** "Cell A1: 'rowspan' must be positive integer, got '-1'"

### neg-8.msc - Trailing Colon
**Error:** Extra colon at end
```
cell:A1:t:Text:colspan:2:
```
**Error Message:** "Attribute '' missing value"

### neg-9.msc - Letters in Colspan
**Error:** Alphabetic characters
```
cell:A1:t:Text:colspan:abc
```
**Error Message:** "Cell A1: 'colspan' must be positive integer, got 'abc'"

### neg-10.msc - Invalid Sheet Columns
**Error:** Non-numeric sheet dimension
```
sheet:c:abc:r:1
```
**Error Message:** "Sheet 'c' (columns) must be positive integer, got 'abc'"

## Important Merge Rules

### ✅ Correct Merge Pattern
When merging A1 with colspan:2 rowspan:2:
```
cell:A1:t:Merged:colspan:2:rowspan:2  ← Main cell with content
cell:B1:t:                             ← Empty (covered by merge)
cell:A2:t:                             ← Empty (covered by merge)
cell:B2:t:                             ← Empty (covered by merge)
```

### ❌ Common Mistakes

1. **Forgetting to mark empty cells:**
```
cell:A1:t:Merged:colspan:2:rowspan:2
# Missing: cell:B1:t:, cell:A2:t:, cell:B2:t:
```

2. **Using wrong coordinate:**
```
cell:A1:t:Merged:colspan:2
cell:C1:t:  # Should be B1, not C1
```

3. **Not calculating all covered cells:**
For a 3x3 merge at A1, you need to mark **8 cells** as empty:
- Row 1: B1, C1
- Row 2: A2, B2, C2
- Row 3: A3, B3, C3

## Merge Calculation Formula

For a merge starting at cell with:
- `colspan:X` (spans X columns)
- `rowspan:Y` (spans Y rows)

**Total cells to mark empty:** `(X × Y) - 1`

**Example:**
- 2x2 merge: (2 × 2) - 1 = 3 empty cells
- 3x3 merge: (3 × 3) - 1 = 8 empty cells
- 5x5 merge: (5 × 5) - 1 = 24 empty cells

## Validation

Run validation on all positive examples:
```bash
node validate_all.js
```

Run validation on negative examples (should all fail):
```bash
node validate_negative.js
```

Expected results:
- Positive examples: 100% valid (50/50)
- Negative examples: 100% correctly invalid (10/10)

## JSON Conversion

Convert all .msc files to JSON and generate training JSONL:
```bash
node convert_to_json.js
```

This creates:
- `json/` directory with individual .json files
- `dimensions_training.jsonl` with all training examples

## Training Data Format

Each training example includes:
- **instruction:** Natural language description of the merge task
- **input:** Empty string
- **output:** Complete SocialCalc save format with merge
- **plan:** Step-by-step explanation of the merge logic

Example:
```json
{
  "instruction": "Create a 2x2 merged cell block",
  "input": "",
  "output": "version:1.5\ncell:A1:t:2x2 Grid Merge:colspan:2:rowspan:2\ncell:B1:t:\ncell:A2:t:\ncell:B2:t:\nsheet:c:2:r:2",
  "plan": "Define cell A1 with colspan:2 rowspan:2 → Mark B1, A2, B2 as empty → All cells in merge area must be marked"
}
```

## Key Learning Points

1. **Always mark empty cells:** Every cell covered by a merge must be explicitly defined
2. **Order matters:** colspan comes before rowspan
3. **Calculate correctly:** Use formula (X × Y) - 1 for empty cell count
4. **Sheet dimensions:** Ensure sheet:c:X:r:Y covers all merged areas
5. **Positive integers only:** Colspan and rowspan must be > 0

## Use Cases Covered

- 📊 **Reports:** Headers, sections, totals
- 📅 **Calendars:** Day headers, time slots
- 📄 **Invoices:** Company info, item descriptions
- 🏢 **Dashboards:** Metric cards, navigation
- 📋 **Tables:** Grouped columns, category labels
- 🎨 **Layouts:** Navigation, content areas, sidebars
- 📱 **Forms:** Labels, input groups

---

**Generated:** December 2024  
**Format Version:** SocialCalc 1.5  
**Total Training Examples:** 60 (50 positive + 10 negative)
