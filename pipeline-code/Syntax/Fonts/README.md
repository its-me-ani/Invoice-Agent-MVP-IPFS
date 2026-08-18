# Font Properties Training Dataset

## Overview
This directory contains **50 validated training examples** demonstrating various font properties in SocialCalc save format (.msc files), plus **10 negative examples** showing common errors.

## Dataset Statistics
- **Total Positive Examples:** 50
- **Total Negative Examples:** 10
- **Validation Status:** ✅ 100% Valid (positive examples)
- **Coverage Areas:**
  - Font styles (normal, italic)
  - Font weights (normal, bold)
  - Font sizes (6pt-72pt, 8px-36px, named sizes)
  - Font families (Arial, Times New Roman, Verdana, Courier, Georgia, etc.)
  - Wildcard values for defaults
  - Multiple fonts in single document
  - Document hierarchy (headers, body, footers)
  - Font stacks with fallbacks
  - Monospace fonts for code
  - Serif and sans-serif families

## Font Syntax

### Font Definition
```
font:<number>:<style> <weight> <size> <family>
```

**Components:**
- `<style>`: `normal`, `italic`, or `*` (default)
- `<weight>`: `normal`, `bold`, or `*` (default)
- `<size>`: `6pt`-`72pt`, `8px`-`36px`, `small`, `medium`, `large`, `x-large`, or `*` (default)
- `<family>`: Font name(s) or `*` (default)

**Example:**
```
font:1:normal bold 14pt Arial,Helvetica,sans-serif
```

### Font Application in Cells
```
cell:<coord>:<attr>:<value>:f:<font_number>
```

**Example:**
```
cell:A1:t:Bold Text:f:1
```

## File Categories

### Basic Font Styles (1-3)
- **1.msc:** Bold text
- **2.msc:** Italic text
- **3.msc:** Bold italic text

### Font Sizes (4-5, 30-37)
- **4.msc:** Large 18pt font
- **5.msc:** Small 8pt font
- **30.msc:** Very small 6pt font
- **31-34.msc:** Large sizes (24pt, 36pt, 48pt, 72pt)
- **35-37.msc:** Pixel-based sizes (8px, 20px, 36px)

### Font Families (6-8, 25-29, 40-43, 46-47)
- **6.msc:** Times New Roman
- **7.msc:** Verdana
- **8.msc:** Courier New
- **25.msc:** Georgia
- **26.msc:** Tahoma
- **27.msc:** Trebuchet MS
- **28.msc:** Impact
- **29.msc:** Comic Sans MS
- **40-43.msc:** Font stacks with fallbacks
- **46-47.msc:** Palatino, Garamond

### Named Sizes (9-12)
- **9.msc:** x-large
- **10.msc:** medium
- **11.msc:** small
- **12.msc:** large

### Pixel Sizes (13, 35-37)
- **13.msc:** 14px font
- **35.msc:** 8px font
- **36.msc:** 20px font
- **37.msc:** 36px font

### Combined Styles (14-17)
- **14.msc:** Bold Helvetica
- **15.msc:** Large bold (16pt)
- **16.msc:** Large italic (16pt)
- **17.msc:** Small bold italic (9pt)

### Wildcard Usage (18-22)
- **18.msc:** Wildcard style
- **19.msc:** Wildcard weight
- **20.msc:** Wildcard size
- **21.msc:** Wildcard family
- **22.msc:** All wildcards

### Multiple Fonts (23-24, 38-39, 44-45, 48-50)
- **23.msc:** Two different font styles
- **24.msc:** Header, body, footer hierarchy
- **38.msc:** Table with bold headers
- **39.msc:** Four-level document hierarchy
- **44.msc:** Form with label and input fonts
- **45.msc:** Priority levels with different fonts
- **48.msc:** Book layout (title, chapter, body)
- **49.msc:** Code with comments
- **50.msc:** Company header with branding

## Negative Examples

### neg-1.msc - Missing Font Definition
```
cell:A1:t:Missing Font Def:f:1
sheet:c:1:r:1
# Missing: font:1:...
```
**Error:** Font 1 not defined

### neg-2.msc - Wrong Component Order
```
font:1:12pt Arial bold normal
```
**Error:** Components in wrong order

### neg-3.msc - Invalid Style Value
```
font:1:slanted bold 12pt Arial
```
**Error:** 'slanted' is not a valid style

### neg-4.msc - Invalid Style 'oblique'
```
font:1:oblique normal 12pt Arial
```
**Error:** 'oblique' is not valid (use 'italic')

### neg-5.msc - Invalid Weight 'bolder'
```
font:1:normal bolder 12pt Arial
```
**Error:** 'bolder' is not valid (use 'bold')

### neg-6.msc - Missing Component
```
font:1:normal Arial
```
**Error:** Missing size component

### neg-7.msc - Invalid Weight Value
```
font:1:normal heavy 12pt Arial
```
**Error:** 'heavy' is not a valid weight

### neg-8.msc - Invalid Format
```
font:1:bold 12pt Arial
```
**Error:** Missing style component, wrong order

### neg-9.msc - Wrong Font Reference
```
cell:A1:t:Wrong Ref:f:99
font:1:normal normal 12pt Arial
```
**Error:** Font 99 not defined

### neg-10.msc - Invalid Order
```
font:1:12pt bold Arial normal
```
**Error:** Size in wrong position

## Usage

### Validate All Files
```bash
node validate_all.js
```

### Validate Negative Examples
```bash
node validate_negative.js
```

### Convert to JSON/JSONL
```bash
node convert_to_json.js
```

This will:
- Create individual JSON files in `json/` directory
- Generate `font_training.jsonl` for fine-tuning

## Training Data Structure

Each training example includes:
- **instruction**: What the user wants to create
- **plan**: Step-by-step approach
- **output**: Key line demonstrating the font syntax

Example:
```json
{
  "instruction": "Create a cell with bold text",
  "plan": "Define font with bold weight → Apply font with f:1 → Use 'normal bold 12pt Arial'",
  "output": "cell:A1:t:Bold Text:f:1"
}
```

## Common Patterns

### Single Font with Bold
```
version:1.5
cell:A1:t:Bold Text:f:1
sheet:c:1:r:1
font:1:normal bold 12pt Arial
```

### Multiple Fonts (Header & Body)
```
version:1.5
cell:A1:t:Header:f:1
cell:A2:t:Body:f:2
sheet:c:1:r:2
font:1:normal bold 18pt Arial
font:2:normal normal 12pt Arial
```

### Font with Fallbacks
```
font:1:normal bold 14pt Arial,Helvetica,sans-serif
```

### Using Wildcards
```
font:1:* bold 12pt Arial        # Use default style
font:2:italic * 12pt Arial      # Use default weight
font:3:normal bold * Arial      # Use default size
font:4:normal bold 12pt *       # Use default family
```

## Best Practices

1. **Define fonts before referencing**: Always define `font:` lines before using them in cells
2. **Use wildcards for defaults**: Use `*` when you want to use the default value
3. **Specify fallbacks**: Include fallback fonts in the family list
4. **Order matters**: Components must be in order: style, weight, size, family
5. **Valid values only**: 
   - Style: `normal`, `italic`, `*`
   - Weight: `normal`, `bold`, `*`
   - Size: `6pt`-`72pt`, `8px`-`36px`, named sizes, `*`
   - Family: Any font name or `*`

## Error Prevention

❌ **Wrong:**
```
font:1:12pt bold Arial normal   # Wrong order
font:2:oblique bold 12pt Arial  # Invalid style
font:3:normal heavy 12pt Arial  # Invalid weight
cell:A1:t:Text:f:99             # Undefined font reference
```

✅ **Correct:**
```
font:1:normal bold 12pt Arial
font:2:italic bold 12pt Arial
font:3:normal normal 12pt Arial
cell:A1:t:Text:f:1
```

## Related Documentation

- [SYNTAX.md](../../docs/SYNTAX.md) - Complete syntax reference
- [TESTING.md](../../docs/TESTING.md) - Testing procedures
- [SUMMARY.md](./SUMMARY.md) - Quick reference

---

**Dataset Version:** 1.0  
**Last Updated:** December 2024  
**Total Examples:** 60 (50 positive + 10 negative)  
**Validation Status:** ✅ All positive examples valid
