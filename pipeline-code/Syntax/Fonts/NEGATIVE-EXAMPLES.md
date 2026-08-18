# Negative Examples - Font Properties

## Purpose
This document catalogs **negative examples** - intentionally incorrect .msc files that demonstrate common errors in font property syntax. These examples are used to train models to recognize and avoid mistakes.

## Overview
- **Total Negative Examples:** 10
- **All examples:** ✅ Produce expected errors
- **Location:** neg-1.msc through neg-10.msc

---

## neg-1.msc - Missing Font Definition

### Error Type
**Reference Error**: Cell references font that doesn't exist

### Content
```
version:1.5
cell:A1:t:Missing Font Def:f:1
sheet:c:1:r:1
```

### What's Wrong
- Cell references `f:1` but no `font:1:...` line exists
- Font must be defined before being referenced

### Correct Version
```
version:1.5
cell:A1:t:Missing Font Def:f:1
sheet:c:1:r:1
font:1:normal bold 12pt Arial
```

### Error Message
```
Cell A1: font 1 not defined. Add 'font:1:...' line
```

---

## neg-2.msc - Wrong Component Order

### Error Type
**Syntax Error**: Font components in incorrect order

### Content
```
version:1.5
cell:A1:t:Wrong Order:f:1
sheet:c:1:r:1
font:1:12pt Arial bold normal
```

### What's Wrong
- Components must be: style, weight, size, family
- Actual order: size, family, weight, style
- Parser expects style first

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Messages
```
Font style must be 'normal', 'italic', or '*', got '12pt'
Font weight must be 'normal', 'bold', or '*', got 'Arial'
```

---

## neg-3.msc - Invalid Style Value

### Error Type
**Value Error**: Invalid font style

### Content
```
version:1.5
cell:A1:t:Invalid Style Value:f:1
sheet:c:1:r:1
font:1:slanted bold 12pt Arial
```

### What's Wrong
- `slanted` is not a valid style
- Valid styles: `normal`, `italic`, `*`

### Correct Version
```
font:1:italic bold 12pt Arial
```

### Error Message
```
Font style must be 'normal', 'italic', or '*', got 'slanted'
```

---

## neg-4.msc - Invalid Style 'oblique'

### Error Type
**Value Error**: CSS-style name not supported

### Content
```
version:1.5
cell:A1:t:Invalid Style:f:1
sheet:c:1:r:1
font:1:oblique normal 12pt Arial
```

### What's Wrong
- `oblique` is CSS terminology
- SocialCalc uses `italic` instead
- Only accepts: `normal`, `italic`, `*`

### Correct Version
```
font:1:italic normal 12pt Arial
```

### Error Message
```
Font style must be 'normal', 'italic', or '*', got 'oblique'
```

---

## neg-5.msc - Invalid Weight 'bolder'

### Error Type
**Value Error**: CSS-style weight not supported

### Content
```
version:1.5
cell:A1:t:Invalid Weight:f:1
sheet:c:1:r:1
font:1:normal bolder 12pt Arial
```

### What's Wrong
- `bolder` is CSS relative weight
- SocialCalc uses absolute weights
- Valid weights: `normal`, `bold`, `*`

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Message
```
Font weight must be 'normal', 'bold', or '*', got 'bolder'
```

---

## neg-6.msc - Missing Component

### Error Type
**Syntax Error**: Incomplete font definition

### Content
```
version:1.5
cell:A1:t:Missing Component:f:1
sheet:c:1:r:1
font:1:normal Arial
```

### What's Wrong
- Missing size component
- Font requires 4 components: style, weight, size, family
- Only 2 provided

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Message
```
Font definition requires at least 3 parts, got 2
```

---

## neg-7.msc - Invalid Weight Value

### Error Type
**Value Error**: Non-standard weight term

### Content
```
version:1.5
cell:A1:t:Invalid Weight Value:f:1
sheet:c:1:r:1
font:1:normal heavy 12pt Arial
```

### What's Wrong
- `heavy` is not a valid weight
- Valid weights: `normal`, `bold`, `*`

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Message
```
Font weight must be 'normal', 'bold', or '*', got 'heavy'
```

---

## neg-8.msc - Invalid Format

### Error Type
**Syntax Error**: Missing required component

### Content
```
version:1.5
cell:A1:t:Invalid Format:f:1
sheet:c:1:r:1
font:1:bold 12pt Arial
```

### What's Wrong
- Missing style component (first position)
- Only 3 components instead of 4
- Parser misinterprets remaining components

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Messages
```
Font style must be 'normal', 'italic', or '*', got 'bold'
Font weight must be 'normal', 'bold', or '*', got '12pt'
```

---

## neg-9.msc - Wrong Font Reference

### Error Type
**Reference Error**: Cell references non-existent font

### Content
```
version:1.5
cell:A1:t:Wrong Ref:f:99
sheet:c:1:r:1
font:1:normal normal 12pt Arial
```

### What's Wrong
- Cell references font 99
- Only font 1 is defined
- Font reference must match definition

### Correct Version
```
version:1.5
cell:A1:t:Wrong Ref:f:1
sheet:c:1:r:1
font:1:normal normal 12pt Arial
```

### Error Message
```
Cell A1: font 99 not defined. Add 'font:99:...' line
```

---

## neg-10.msc - Invalid Component Order

### Error Type
**Syntax Error**: Size in wrong position

### Content
```
version:1.5
cell:A1:t:Invalid Font Format:f:1
sheet:c:1:r:1
font:1:12pt bold Arial normal
```

### What's Wrong
- Size (12pt) is first instead of third
- Correct order: style, weight, size, family
- Parser treats 12pt as style

### Correct Version
```
font:1:normal bold 12pt Arial
```

### Error Message
```
Font style must be 'normal', 'italic', or '*', got '12pt'
```

---

## Common Error Patterns

### 1. Missing Definitions
```
❌ cell:A1:f:5 without font:5:...
✅ Define font before using
```

### 2. Wrong Order
```
❌ font:1:12pt bold Arial normal
✅ font:1:normal bold 12pt Arial
```

### 3. Invalid Style Values
```
❌ oblique, slanted, underline
✅ normal, italic, *
```

### 4. Invalid Weight Values
```
❌ bolder, lighter, heavy, 700
✅ normal, bold, *
```

### 5. Missing Components
```
❌ font:1:bold Arial
✅ font:1:normal bold 12pt Arial
```

### 6. Wrong References
```
❌ f:99 when only font:1 exists
✅ f:1 matching defined font
```

## Error Categories

| Category | Count | Examples |
|----------|-------|----------|
| Missing Definition | 1 | neg-1 |
| Wrong Order | 2 | neg-2, neg-10 |
| Invalid Style | 2 | neg-3, neg-4 |
| Invalid Weight | 2 | neg-5, neg-7 |
| Missing Component | 2 | neg-6, neg-8 |
| Wrong Reference | 1 | neg-9 |

## Validation

Run validation to confirm errors:
```bash
node validate_negative.js
```

Expected output:
```
✓ File has errors as expected (X errors)
```

All negative examples should **fail** validation.

## Learning Points

1. **Font components have strict order**: style → weight → size → family
2. **Only specific values allowed**: Limited to documented options
3. **Definitions before references**: Define font:N before using f:N
4. **No CSS terminology**: Use SocialCalc-specific terms
5. **All components required**: Cannot omit style, weight, or size (unless using *)
6. **References must match**: Font number in cell must exist

## Related Documentation

- [README.md](./README.md) - Full dataset documentation
- [SUMMARY.md](./SUMMARY.md) - Quick reference
- [ERROR-QUICK-REFERENCE.md](./ERROR-QUICK-REFERENCE.md) - Error lookup

---

**Total Negative Examples:** 10  
**Validation Status:** ✅ All produce expected errors  
**Purpose:** Training data for error detection and correction
