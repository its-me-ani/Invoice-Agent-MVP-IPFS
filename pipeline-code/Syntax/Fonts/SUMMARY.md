# Font Properties - Quick Summary

## 📊 Dataset Overview
- **Total Examples:** 60 (50 positive + 10 negative)
- **Validation:** ✅ 100% valid (positive examples)
- **Format:** SocialCalc .msc files

## 🎨 Font Syntax

```
font:<num>:<style> <weight> <size> <family>
cell:<coord>:t:<text>:f:<num>
```

## 📋 Components

| Component | Valid Values | Example |
|-----------|--------------|---------|
| **Style** | `normal`, `italic`, `*` | `normal` |
| **Weight** | `normal`, `bold`, `*` | `bold` |
| **Size** | `6pt-72pt`, `8px-36px`, named, `*` | `12pt` |
| **Family** | Font names, `*` | `Arial` |

## 🎯 Coverage

### Styles (3 examples)
- Normal, Italic, Bold Italic

### Sizes (15 examples)
- Points: 6pt, 8pt, 9pt, 10pt, 12pt, 14pt, 16pt, 18pt, 20pt, 24pt, 32pt, 36pt, 48pt, 72pt
- Pixels: 8px, 14px, 20px, 36px
- Named: small, medium, large, x-large

### Families (20 examples)
- Arial, Verdana, Helvetica, Tahoma, Trebuchet MS
- Times New Roman, Georgia, Palatino, Garamond
- Courier New (monospace)
- Impact, Comic Sans MS
- With fallbacks: Arial,Helvetica,sans-serif

### Wildcards (5 examples)
- Style: `* bold 12pt Arial`
- Weight: `italic * 12pt Arial`
- Size: `normal bold * Arial`
- Family: `normal bold 12pt *`
- All: `* * * *`

### Multi-Font (12 examples)
- Headers + body text
- Document hierarchy (4 levels)
- Table formatting
- Form labels + inputs
- Code + comments
- Company branding

## ❌ Negative Examples (10)

1. **Missing definition** - Font referenced but not defined
2. **Wrong order** - Components in incorrect sequence
3. **Invalid style** - 'slanted' instead of 'italic'
4. **Invalid style** - 'oblique' instead of 'italic'
5. **Invalid weight** - 'bolder' instead of 'bold'
6. **Missing component** - Size missing
7. **Invalid weight** - 'heavy' instead of 'bold'
8. **Invalid format** - Missing style component
9. **Wrong reference** - Font 99 not defined
10. **Invalid order** - Size before style/weight

## 🔍 Common Patterns

### Bold Text
```
font:1:normal bold 12pt Arial
cell:A1:t:Bold Text:f:1
```

### Italic Text
```
font:1:italic normal 12pt Arial
cell:A1:t:Italic Text:f:1
```

### Large Header
```
font:1:normal bold 18pt Arial
cell:A1:t:Header:f:1
```

### Code Font
```
font:1:normal normal 12pt 'Courier New',monospace
cell:A1:t:function():f:1
```

### Document Hierarchy
```
font:1:normal bold 24pt Georgia,serif      # Title
font:2:italic bold 16pt Georgia,serif      # Subtitle
font:3:normal normal 12pt Georgia,serif    # Body
font:4:italic normal 10pt Georgia,serif    # Notes
```

## ✅ Quick Validation

```bash
# Validate all positive examples
node validate_all.js

# Check negative examples
node validate_negative.js

# Convert to training format
node convert_to_json.js
```

## 📝 Key Rules

1. ✅ Style before weight before size before family
2. ✅ Define fonts before using in cells
3. ✅ Use `*` for default values
4. ✅ Quote font names with spaces
5. ✅ Include fallback fonts

## 🚫 Common Mistakes

```
❌ font:1:12pt bold Arial normal     # Wrong order
❌ font:1:oblique bold 12pt Arial    # Invalid style
❌ font:1:normal heavy 12pt Arial    # Invalid weight
❌ cell:A1:t:Text:f:99               # Undefined reference
❌ font:1:normal Arial               # Missing size

✅ font:1:normal bold 12pt Arial
✅ font:1:italic normal 12pt Arial
✅ font:1:normal bold 14pt Arial
✅ cell:A1:t:Text:f:1
✅ font:1:normal bold 12pt Arial
```

---

**Files:** 1-50.msc (positive), neg-1 to neg-10.msc (negative)  
**Scripts:** validate_all.js, validate_negative.js, convert_to_json.js
