# Font Errors - Quick Reference Guide

## 🚨 Common Font Errors

### Error 1: Missing Font Definition
**Symptom:** Cell references undefined font
```
❌ cell:A1:t:Text:f:5
   # No font:5:... exists

✅ font:5:normal bold 12pt Arial
   cell:A1:t:Text:f:5
```

**Error Message:**
```
Cell A1: font 5 not defined. Add 'font:5:...' line
```

---

### Error 2: Wrong Component Order
**Symptom:** Font components not in correct sequence
```
❌ font:1:12pt bold Arial normal
   # Order should be: style weight size family

✅ font:1:normal bold 12pt Arial
```

**Error Message:**
```
Font style must be 'normal', 'italic', or '*', got '12pt'
Font weight must be 'normal', 'bold', or '*', got 'Arial'
```

---

### Error 3: Invalid Font Style
**Symptom:** Using non-standard style values
```
❌ font:1:oblique bold 12pt Arial
❌ font:1:slanted bold 12pt Arial
❌ font:1:underline bold 12pt Arial

✅ font:1:italic bold 12pt Arial
✅ font:1:normal bold 12pt Arial
✅ font:1:* bold 12pt Arial
```

**Valid Styles:** `normal`, `italic`, `*`

**Error Message:**
```
Font style must be 'normal', 'italic', or '*', got 'oblique'
```

---

### Error 4: Invalid Font Weight
**Symptom:** Using CSS or non-standard weight values
```
❌ font:1:normal bolder 12pt Arial
❌ font:1:normal heavy 12pt Arial
❌ font:1:normal 700 12pt Arial

✅ font:1:normal bold 12pt Arial
✅ font:1:normal normal 12pt Arial
✅ font:1:normal * 12pt Arial
```

**Valid Weights:** `normal`, `bold`, `*`

**Error Message:**
```
Font weight must be 'normal', 'bold', or '*', got 'bolder'
```

---

### Error 5: Missing Components
**Symptom:** Font definition incomplete
```
❌ font:1:bold Arial           # Missing style and size
❌ font:1:normal Arial         # Missing weight and size
❌ font:1:normal bold Arial    # Missing size

✅ font:1:normal bold 12pt Arial
✅ font:1:* * * Arial          # Using wildcards
```

**Error Message:**
```
Font definition requires at least 3 parts, got 2
```

---

### Error 6: Wrong Font Reference Number
**Symptom:** Cell uses non-existent font number
```
❌ cell:A1:t:Text:f:99
   font:1:normal bold 12pt Arial
   # Font 99 doesn't exist

✅ cell:A1:t:Text:f:1
   font:1:normal bold 12pt Arial
```

**Error Message:**
```
Cell A1: font 99 not defined. Add 'font:99:...' line
```

---

## 📋 Font Syntax Reference

### Complete Format
```
font:<number>:<style> <weight> <size> <family>
```

### Component Rules

| Position | Component | Valid Values | Examples |
|----------|-----------|--------------|----------|
| 1 | Style | `normal`, `italic`, `*` | `normal`, `italic` |
| 2 | Weight | `normal`, `bold`, `*` | `bold`, `normal` |
| 3 | Size | `6pt`-`72pt`, `8px`-`36px`, named, `*` | `12pt`, `14px`, `large` |
| 4 | Family | Font name(s), `*` | `Arial`, `'Times New Roman'` |

### Named Sizes
Valid: `small`, `medium`, `large`, `x-large`, `*`

### Point Sizes
Valid: `6pt` through `72pt`

### Pixel Sizes
Valid: `8px` through `36px`

---

## ✅ Correct Examples

### Basic Fonts
```
font:1:normal bold 12pt Arial
font:2:italic normal 12pt Arial
font:3:italic bold 14pt Arial
font:4:normal normal 10pt Arial
```

### Different Sizes
```
font:1:normal bold 18pt Arial      # Large header
font:2:normal bold 14pt Arial      # Subheader
font:3:normal normal 12pt Arial    # Body
font:4:italic normal 10pt Arial    # Note
```

### Font Families
```
font:1:normal bold 12pt 'Times New Roman',serif
font:2:normal normal 12pt Verdana,sans-serif
font:3:normal normal 12pt 'Courier New',monospace
font:4:normal bold 14pt Georgia,serif
```

### Using Wildcards
```
font:1:* bold 12pt Arial           # Default style
font:2:italic * 12pt Arial         # Default weight
font:3:normal bold * Arial         # Default size
font:4:normal bold 12pt *          # Default family
font:5:* * * *                     # All defaults
```

### Pixel Sizes
```
font:1:normal normal 14px Arial
font:2:normal bold 16px Arial
font:3:normal normal 20px Verdana
```

### Named Sizes
```
font:1:normal bold x-large Arial
font:2:normal bold large Arial
font:3:normal normal medium Arial
font:4:normal normal small Arial
```

---

## 🔍 Troubleshooting Guide

### Problem: "Font X not defined"
**Cause:** Cell references font that doesn't exist
**Solution:** Add `font:X:...` line before cell that uses it

### Problem: "Font style must be..."
**Cause:** Invalid style value or wrong order
**Solution:** 
- Use only `normal`, `italic`, or `*`
- Ensure style is first component
- Check: `font:1:STYLE weight size family`

### Problem: "Font weight must be..."
**Cause:** Invalid weight value or wrong order
**Solution:**
- Use only `normal`, `bold`, or `*`
- Ensure weight is second component
- Check: `font:1:style WEIGHT size family`

### Problem: "Font definition requires at least 3 parts"
**Cause:** Missing required components
**Solution:** Provide all 4 components: style, weight, size, family
```
font:1:normal bold 12pt Arial
      ^      ^    ^    ^
   style  weight size family
```

---

## 📝 Best Practices

### 1. Define Before Use
```
✅ Correct order:
font:1:normal bold 12pt Arial
cell:A1:t:Text:f:1

❌ Wrong order:
cell:A1:t:Text:f:1
font:1:normal bold 12pt Arial
```

### 2. Use Consistent Numbering
```
✅ Sequential:
font:1:...
font:2:...
font:3:...

✅ Also valid (with gaps):
font:1:...
font:5:...
font:10:...
```

### 3. Quote Font Names with Spaces
```
✅ font:1:normal bold 12pt 'Times New Roman',serif
❌ font:1:normal bold 12pt Times New Roman,serif
```

### 4. Include Fallback Fonts
```
✅ font:1:normal bold 12pt Arial,Helvetica,sans-serif
✅ font:2:normal normal 12pt Georgia,serif
✅ font:3:normal normal 12pt 'Courier New',monospace
```

### 5. Use Wildcards for Defaults
```
font:1:* bold 12pt Arial          # Normal style by default
font:2:italic * 12pt Arial        # Normal weight by default
font:3:normal bold * Arial        # Default size
```

---

## 🎯 Quick Validation

### Valid Font Definition Checklist
- [ ] Has 4 components: style, weight, size, family
- [ ] Style is `normal`, `italic`, or `*`
- [ ] Weight is `normal`, `bold`, or `*`
- [ ] Size is valid (6pt-72pt, 8px-36px, named, or `*`)
- [ ] Font number matches cell reference
- [ ] Defined before first use in cells

### Common Validation Commands
```bash
# Validate all files
node validate_all.js

# Check negative examples
node validate_negative.js

# Convert to JSON/JSONL
node convert_to_json.js
```

---

## 📚 Related Documentation

- [README.md](./README.md) - Complete dataset documentation
- [SUMMARY.md](./SUMMARY.md) - Quick summary
- [NEGATIVE-EXAMPLES.md](./NEGATIVE-EXAMPLES.md) - Detailed error examples
- [../../docs/SYNTAX.md](../../docs/SYNTAX.md) - Full syntax reference

---

**Quick Tip:** When in doubt, start with:
```
font:1:normal bold 12pt Arial
```
This is the most common pattern and always works!
