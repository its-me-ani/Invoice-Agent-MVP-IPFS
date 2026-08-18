# Error Quick Reference - Dimensions & Merging

## 🚨 Common Errors & Fixes

### 1. Missing Empty Cell Markers

❌ **Wrong:**
```
cell:A1:t:Merged:colspan:2
# Missing cell:B1:t:
```

✅ **Correct:**
```
cell:A1:t:Merged:colspan:2
cell:B1:t:
```

**Rule:** Every cell covered by a merge must be marked empty.

---

### 2. Trailing Colon

❌ **Wrong:**
```
cell:A1:t:Text:colspan:2:
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2
```

**Error:** `Attribute '' missing value`

---

### 3. Double Colon

❌ **Wrong:**
```
cell:A1:t:Text::colspan:2
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2
```

**Error:** Creates empty attribute name

---

### 4. Missing Value

❌ **Wrong:**
```
cell:A1:t:Text:colspan
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2
```

**Error:** `Attribute 'colspan' missing value`

---

### 5. Zero Value

❌ **Wrong:**
```
cell:A1:t:Text:colspan:0
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2
```

**Error:** `'colspan' must be positive integer, got '0'`

---

### 6. Negative Value

❌ **Wrong:**
```
cell:A1:t:Text:rowspan:-1
```

✅ **Correct:**
```
cell:A1:t:Text:rowspan:2
```

**Error:** `'rowspan' must be positive integer, got '-1'`

---

### 7. Non-Numeric Value

❌ **Wrong:**
```
cell:A1:t:Text:colspan:two
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2
```

**Error:** `'colspan' must be positive integer, got 'two'`

---

### 8. Wrong Attribute Order

⚠️ **Works but not standard:**
```
cell:A1:t:Text:rowspan:2:colspan:3
```

✅ **Preferred:**
```
cell:A1:t:Text:colspan:3:rowspan:2
```

**Note:** colspan should come before rowspan

---

### 9. Incomplete Merge Coverage

❌ **Wrong (2x2 merge):**
```
cell:A1:t:Text:colspan:2:rowspan:2
cell:B1:t:
cell:A2:t:
# Missing cell:B2:t:
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:2:rowspan:2
cell:B1:t:
cell:A2:t:
cell:B2:t:
```

**Formula:** (X × Y) - 1 empty cells needed

---

### 10. Sheet Dimensions Too Small

❌ **Wrong:**
```
cell:A1:t:Text:colspan:5
sheet:c:3:r:1
```

✅ **Correct:**
```
cell:A1:t:Text:colspan:5
sheet:c:5:r:1
```

**Rule:** Sheet dimensions must encompass all merged areas

---

## 🔢 Empty Cell Calculation

| Merge Size | Empty Cells Needed | Example |
|------------|-------------------|---------|
| 2x1 | 1 | `(2×1)-1 = 1` |
| 1x2 | 1 | `(1×2)-1 = 1` |
| 2x2 | 3 | `(2×2)-1 = 3` |
| 3x3 | 8 | `(3×3)-1 = 8` |
| 4x2 | 7 | `(4×2)-1 = 7` |
| 5x5 | 24 | `(5×5)-1 = 24` |

## 📍 Coordinate Examples

### 2x2 Merge at A1
```
cell:A1:t:Main:colspan:2:rowspan:2
cell:B1:t:    ← Right
cell:A2:t:    ← Below
cell:B2:t:    ← Diagonal
```

### 3x2 Merge at B2
```
cell:B2:t:Main:colspan:3:rowspan:2
cell:C2:t:    ← Right 1
cell:D2:t:    ← Right 2
cell:B3:t:    ← Below left
cell:C3:t:    ← Below center
cell:D3:t:    ← Below right
```

### 2x3 Merge at A1
```
cell:A1:t:Main:colspan:2:rowspan:3
cell:B1:t:    ← Right top
cell:A2:t:    ← Below 1
cell:B2:t:    ← Diagonal 1
cell:A3:t:    ← Below 2
cell:B3:t:    ← Diagonal 2
```

## ⚡ Quick Validation

Run this to check your files:
```bash
node validate_all.js       # For valid examples
node validate_negative.js  # For error examples
```

## 🎯 Checklist Before Saving

- [ ] All colspan/rowspan values are positive integers
- [ ] No trailing colons at end of lines
- [ ] No double colons (::) in attributes
- [ ] All attributes have values
- [ ] Empty cells marked for merged areas
- [ ] Sheet dimensions cover all cells
- [ ] Column references are letters (A, B, C...)
- [ ] Row references are numbers (1, 2, 3...)

## 📖 See Also

- `README.md` - Complete documentation
- `NEGATIVE-EXAMPLES.md` - Detailed error explanations
- `SUMMARY.md` - Dataset overview
- `SYNTAX.md` (in docs/) - Full format specification

---

**Pro Tip:** Use the formula **(colspan × rowspan) - 1** to quickly calculate how many empty cells you need!
