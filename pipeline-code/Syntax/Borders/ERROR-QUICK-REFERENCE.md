# Border Syntax Errors - Quick Reference

## Error Detection Patterns

### 1. Empty Border Values
```
❌ INVALID: b::1::1
✅ VALID:   b:0:1:0:1
```
**Pattern:** Look for `::` in border tuples  
**Fix:** Replace empty positions with `0`

---

### 2. Invalid Color Format (Named Colors)
```
❌ INVALID: border:1:1px solid blue
✅ VALID:   border:1:1px solid rgb(0,0,255)
```
**Pattern:** Color name after style keyword  
**Fix:** Convert to `rgb(R,G,B)` format

---

### 3. Trailing Colon
```
❌ INVALID: b:1:1:1:1:
✅ VALID:   b:1:1:1:1
```
**Pattern:** Colon at end of line or before next attribute  
**Fix:** Remove trailing colon

---

### 4. Undefined Border Reference
```
❌ INVALID: cell:A1:b:5:1:1:1  (border:5 not defined)
✅ VALID:   cell:A1:b:1:1:1:1  (border:1 exists)
```
**Pattern:** Border ID used but not defined  
**Fix:** Define border or use existing ID

---

### 5. Incomplete Border Tuple (2 values)
```
❌ INVALID: b:1:1
✅ VALID:   b:1:1:0:0
```
**Pattern:** Border tuple with < 4 values  
**Fix:** Add missing position values

---

### 6. Double Colon Before Attribute
```
❌ INVALID: b:1:1:1:1::bg:2
✅ VALID:   b:1:1:1:1:bg:2
```
**Pattern:** `::` between attributes  
**Fix:** Remove extra colon

---

### 7. Empty Border Definition
```
❌ INVALID: border:2:
✅ VALID:   border:2:1px solid rgb(0,0,0)
```
**Pattern:** Border definition with no value  
**Fix:** Add thickness, style, and color

---

### 8. Invalid Border Thickness
```
❌ INVALID: border:1:thick solid rgb(0,0,0)
✅ VALID:   border:1:3px solid rgb(0,0,0)
```
**Pattern:** CSS keywords (thin, medium, thick)  
**Fix:** Use pixel values (1px, 2px, 3px)

---

### 9. Too Many Border Values
```
❌ INVALID: b:1:1:1:1:1
✅ VALID:   b:1:1:1:1
```
**Pattern:** Border tuple with > 4 values  
**Fix:** Remove extra values

---

### 10. Incomplete Border Tuple (3 values)
```
❌ INVALID: b:1:1:1
✅ VALID:   b:1:1:1:0
```
**Pattern:** Border tuple with exactly 3 values  
**Fix:** Add missing left position

---

## Validation Rules Summary

### Border Definition Format
```
border:<ID>:<thickness> <style> <color>
```
- **ID:** Unique positive integer
- **Thickness:** Pixel value (e.g., 1px, 2px)
- **Style:** solid | dashed | dotted | double
- **Color:** rgb(R,G,B) or #RRGGBB

### Border Application Format
```
cell:<COORD>:...:b:<top>:<right>:<bottom>:<left>
```
- **Tuple:** Exactly 4 values (top, right, bottom, left)
- **Values:** Border ID (1, 2, 3...) or 0 (no border)
- **Order:** Clockwise from top

### Common Mistakes
1. ❌ Empty values (`::`)
2. ❌ Wrong value count (not 4)
3. ❌ Undefined border IDs
4. ❌ Named colors
5. ❌ CSS keywords for thickness
6. ❌ Extra colons
7. ❌ Missing definitions

### Best Practices
1. ✅ Always use `0` for no border
2. ✅ Define all borders before use
3. ✅ Use rgb() for colors
4. ✅ Use pixel values for thickness
5. ✅ Exactly 4 position values
6. ✅ No trailing colons
7. ✅ No double colons

---

**See:** NEGATIVE-EXAMPLES.md for detailed explanations  
**Training Data:** border_negative_training.jsonl  
**Last Updated:** December 13, 2025
