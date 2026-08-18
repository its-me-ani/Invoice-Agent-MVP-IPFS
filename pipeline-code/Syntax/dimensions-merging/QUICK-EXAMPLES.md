# Quick Examples - Dimensions & Merging

## Basic Examples

### Example 1: Horizontal Merge (2 columns)
```
version:1.5
cell:A1:t:Simple 2x1 Merge:colspan:2
cell:B1:t:
sheet:c:2:r:1
```
**Result:** Cell A1 spans 2 columns. B1 is covered (empty).

---

### Example 2: Vertical Merge (2 rows)
```
version:1.5
cell:A1:t:Simple 1x2 Merge:rowspan:2
cell:A2:t:
sheet:c:1:r:2
```
**Result:** Cell A1 spans 2 rows. A2 is covered (empty).

---

### Example 3: Grid Merge (2x2)
```
version:1.5
cell:A1:t:2x2 Grid Merge:colspan:2:rowspan:2
cell:B1:t:
cell:A2:t:
cell:B2:t:
sheet:c:2:r:2
```
**Result:** Cell A1 spans 2 columns and 2 rows. B1, A2, B2 are covered.

---

## Intermediate Examples

### Example 7: Table Header (4 columns)
```
version:1.5
cell:A1:t:Header:colspan:4
cell:B1:t:
cell:C1:t:
cell:D1:t:
cell:A2:t:Data 1
cell:B2:t:Data 2
cell:C2:t:Data 3
cell:D2:t:Data 4
sheet:c:4:r:2
```
**Result:** Header spans all 4 columns, data cells below are individual.

---

### Example 15: Four 2x2 Blocks
```
version:1.5
cell:A1:t:Top Left:colspan:2:rowspan:2
cell:B1:t:
cell:A2:t:
cell:B2:t:
cell:C1:t:Top Right:colspan:2:rowspan:2
cell:D1:t:
cell:C2:t:
cell:D2:t:
cell:A3:t:Bottom Left:colspan:2:rowspan:2
cell:B3:t:
cell:A4:t:
cell:B4:t:
cell:C3:t:Bottom Right:colspan:2:rowspan:2
cell:D3:t:
cell:C4:t:
cell:D4:t:
sheet:c:4:r:4
```
**Result:** 4x4 grid with four separate 2x2 merged blocks.

---

## Advanced Examples

### Example 30: Page Layout
```
version:1.5
cell:A1:t:Title Area:colspan:3:rowspan:2
cell:B1:t:
cell:C1:t:
cell:A2:t:
cell:B2:t:
cell:C2:t:
cell:A3:t:Content:colspan:2
cell:B3:t:
cell:C3:t:Sidebar:rowspan:2
cell:A4:t:Footer
cell:B4:t:Info
cell:C4:t:
sheet:c:3:r:4
```
**Result:** Complex layout with title (3x2), content (2x1), sidebar (1x2), and footer.

---

### Example 50: Complete Web Layout
```
version:1.5
cell:A1:t:Complex Layout:colspan:6
cell:B1:t:
cell:C1:t:
cell:D1:t:
cell:E1:t:
cell:F1:t:
cell:A2:t:Nav:rowspan:4
cell:A3:t:
cell:A4:t:
cell:A5:t:
cell:B2:t:Header:colspan:5
cell:C2:t:
cell:D2:t:
cell:E2:t:
cell:F2:t:
cell:B3:t:Main:colspan:3:rowspan:2
cell:C3:t:
cell:D3:t:
cell:B4:t:
cell:C4:t:
cell:D4:t:
cell:E3:t:Side:colspan:2:rowspan:2
cell:F3:t:
cell:E4:t:
cell:F4:t:
cell:B5:t:Footer:colspan:5
cell:C5:t:
cell:D5:t:
cell:E5:t:
cell:F5:t:
sheet:c:6:r:5
```
**Result:** Full page layout with navigation, header, main content, sidebar, and footer.

---

## Visual Guides

### 2x2 Merge Pattern
```
┌─────────────┬──────┐
│ A1          │      │  ← A1 (main cell with content)
│ (colspan:2, │      │     B1 (empty, covered by merge)
│  rowspan:2) │      │     A2 (empty, covered by merge)
├─────────────┤      │     B2 (empty, covered by merge)
│             │      │
└─────────────┴──────┘
     A           B
```

### 3x3 Merge Pattern
```
┌──────────────────────────┐
│ A1                       │  ← A1 (main cell)
│ (colspan:3, rowspan:3)   │  ← B1, C1 (empty)
│                          │  ← A2, B2, C2 (empty)
│                          │  ← A3, B3, C3 (empty)
│                          │
└──────────────────────────┘
     A      B      C
```

### Mixed Layout
```
┌───────────────────────────┬─────┐
│ Header (colspan:4)        │     │
├──────┬──────┬──────┬──────┼─────┤
│ A2   │ B2   │ C2   │ D2   │ E2  │
└──────┴──────┴──────┴──────┴─────┘
   A      B      C      D      E
```

---

## Common Patterns

### Full Width Header
```
cell:A1:t:Full Width:colspan:N
cell:B1:t: ... cell:N1:t:
```

### Full Height Sidebar
```
cell:A1:t:Sidebar:rowspan:N
cell:A2:t: ... cell:AN:t:
```

### Center Block
```
cell:B2:t:Center:colspan:X:rowspan:Y
# Mark (X × Y) - 1 cells empty starting from B2
```

---

## Testing Your Merge

1. **Calculate empty cells:** (colspan × rowspan) - 1
2. **Mark coordinates:** Starting cell + offsets for all covered cells
3. **Validate:** `node validate_all.js`
4. **Visual check:** Draw grid to verify coverage

---

**Quick Reference:**
- 2x1 merge = 1 empty cell (right)
- 1x2 merge = 1 empty cell (below)
- 2x2 merge = 3 empty cells (right, below, diagonal)
- 3x3 merge = 8 empty cells (2 right, 3 below row 1, 3 below row 2)

See `README.md` for complete documentation!
