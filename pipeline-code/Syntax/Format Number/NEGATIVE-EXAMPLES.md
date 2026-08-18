# Format Number - Negative Examples

This document explains the negative examples that demonstrate common errors when working with number formatting.

## Error Categories

### 1. Undefined Format Reference (neg-1.msc)

**Error**: Cell references `ntvf:99` but `valueformat:99` is not defined

```
version:1.5
cell:A1:v:1234:ntvf:99
sheet:c:1:r:1
```

**Problem**: The cell references format ID 99, but no valueformat:99 definition exists.

**Fix**: Define the valueformat or use an existing format ID:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

---

### 2. Missing Valueformat Definition (neg-2.msc)

**Error**: Cell has `ntvf` attribute but no valueformat definitions exist

```
version:1.5
cell:A1:v:1234.56:ntvf:1
sheet:c:1:r:1
```

**Problem**: Cell references ntvf:1 but there's no valueformat line at all.

**Fix**: Add the valueformat definition:
```
version:1.5
cell:A1:v:1234.56:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0.00
```

---

### 3. Non-Numeric Format ID (neg-3.msc)

**Error**: Using non-numeric characters as format ID

```
version:1.5
cell:A1:v:1234:ntvf:abc
sheet:c:1:r:1
valueformat:abc:#,##0
```

**Problem**: Format IDs must be numeric (1, 2, 3, etc.), not text like "abc".

**Fix**: Use numeric IDs:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

---

### 4. Empty Format Pattern (neg-4.msc)

**Error**: Valueformat definition has no pattern

```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:
```

**Problem**: The valueformat is defined but the pattern is empty.

**Fix**: Provide a valid pattern:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

---

### 5. Duplicate ntvf Attributes (neg-5.msc)

**Error**: Same cell has multiple ntvf attributes

```
version:1.5
cell:A1:v:1234:ntvf:1:ntvf:2
sheet:c:1:r:1
valueformat:1:#,##0
valueformat:2:#,##0.00
```

**Problem**: A cell can only have one number format applied.

**Fix**: Use only one ntvf attribute:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0.00
```

---

### 6. Text Value with Number Format (neg-6.msc)

**Error**: Applying number format to text value

```
version:1.5
cell:A1:t:Not a number:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0.00
```

**Problem**: Using `t:` (text) with `ntvf` (number format). Number formats require numeric values.

**Fix**: Use `v:` for numeric values:
```
version:1.5
cell:A1:v:1234.56:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0.00
```

---

### 7. Negative Format ID (neg-7.msc)

**Error**: Using negative numbers as format ID

```
version:1.5
cell:A1:v:1234:ntvf:-1
sheet:c:1:r:1
valueformat:-1:#,##0
```

**Problem**: Format IDs must be positive integers.

**Fix**: Use positive integers:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

---

### 8. Invalid Format Pattern (neg-8.msc)

**Error**: Malformed pattern with incorrect separator placement

```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:##,##,##0
```

**Problem**: Comma separators should occur every 3 digits, not arbitrary positions.

**Fix**: Use correct pattern:
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

---

### 9. Mismatched Format Reference (neg-9.msc)

**Error**: Cell references one format but different format is defined

```
version:1.5
cell:A1:v:1234:ntvf:1
cell:A2:v:5678:ntvf:1
sheet:c:1:r:2
valueformat:2:#,##0.00
```

**Problem**: Cells reference ntvf:1 but only valueformat:2 exists.

**Fix**: Match the references:
```
version:1.5
cell:A1:v:1234:ntvf:1
cell:A2:v:5678:ntvf:1
sheet:c:1:r:2
valueformat:1:#,##0.00
```

---

### 10. Invalid Pattern Syntax (neg-10.msc)

**Error**: Double percent signs in percentage format

```
version:1.5
cell:A1:v:0.5:ntvf:1
sheet:c:1:r:1
valueformat:1:0.00%%
```

**Problem**: Only one percent sign is needed in percentage format.

**Fix**: Use single percent sign:
```
version:1.5
cell:A1:v:0.5:ntvf:1
sheet:c:1:r:1
valueformat:1:0.00%
```

---

## Common Patterns of Errors

### 1. Reference Errors
- Undefined format IDs
- Mismatched format references
- Wrong format ID types (text instead of number)

### 2. Definition Errors
- Missing valueformat lines
- Empty patterns
- Invalid pattern syntax

### 3. Type Errors
- Text values with number formats
- Wrong value types for format

### 4. Attribute Errors
- Duplicate attributes
- Negative IDs
- Invalid attribute combinations

## Validation Rules

To avoid these errors, ensure:

1. ✅ Every `ntvf:X` has corresponding `valueformat:X`
2. ✅ Format IDs are positive integers
3. ✅ Format patterns are not empty
4. ✅ Only one ntvf per cell
5. ✅ Use `v:` (numeric) values with ntvf
6. ✅ Format patterns follow correct syntax
7. ✅ All referenced formats are defined

## Testing Negative Examples

Run the validation script to verify negative examples:

```bash
node validate_negative.js
```

This confirms each negative example properly demonstrates its intended error pattern.
