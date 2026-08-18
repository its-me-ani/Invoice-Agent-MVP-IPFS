# Border Properties Training Dataset

## Overview
This directory contains **50 validated training examples** demonstrating various border properties in SocialCalc save format (.msc files).

## Dataset Statistics
- **Total Examples:** 50
- **Validation Status:** ✅ 100% Valid
- **Coverage Areas:**
  - Single border sides (top, right, bottom, left)
  - Multiple border combinations
  - Different border styles (solid, dashed, dotted, double)
  - Various border thicknesses (1px - 6px)
  - Multiple color formats (RGB and Hex)
  - Complex table structures
  - Merged cells with borders
  - Table layouts with selective borders
  - Grid patterns and alternating backgrounds

## Border Syntax

### Border Definition
```
border:<number>:<thickness> <style> <color>
```

**Example:**
```
border:1:2px solid rgb(255,0,0)
```

### Border Application in Cells
```
cell:<coord>:<attr>:<value>:b:<top>:<right>:<bottom>:<left>
```

**Border Order:** Top, Right, Bottom, Left (clockwise from top)

**Example:**
```
cell:A1:t:Text:b:1:1:1:1
```

## File Categories

### Basic Border Sides (1-4)
- **1.msc:** Top border only
- **2.msc:** Right border only
- **3.msc:** Bottom border only
- **4.msc:** Left border only

### All Sides (5, 7, 10, 17-20, 23-26, 29-30, 32-33, 35, 39-40)
Various styles with all borders applied uniformly.

### Border Styles (8-10)
- **8.msc:** Dashed border
- **9.msc:** Dotted border
- **10.msc:** Double border

### Mixed Borders (6)
- **6.msc:** Different border style on each side (top: solid, right: dashed, bottom: dotted, left: double)

### Border Combinations (12-13, 27-28)
- **12.msc:** Top and bottom only
- **13.msc:** Left and right only
- **27.msc:** Top and left only
- **28.msc:** Bottom and right only

### Color Variations
- RGB format: `rgb(R,G,B)`
- Hex format: `#RRGGBB`
- Various colors: Black, Red, Blue, Green, Yellow, Purple, Cyan, Orange, Pink, Brown, Navy, Teal, Maroon, Gray, Silver, Gold, White

### Thickness Variations
- 1px (standard)
- 2px (medium)
- 3px (thick)
- 4px-6px (very thick)

### Complex Examples

#### Multiple Cells (14)
```
version:1.5
cell:A1:t:Multiple Cells with Borders:b:1:1:1:1
cell:B1:t:Cell B1:b:1:1:1:1
cell:A2:t:Cell A2:b:1:1:1:1
cell:B2:t:Cell B2:b:1:1:1:1
sheet:c:2:r:2
border:1:1px solid rgb(0,0,0)
```

#### Table Structure (15)
```
version:1.5
cell:A1:t:Table Header:b:1:1:2:1
cell:B1:t:Header 2:b:1:1:2:0
cell:A2:t:Data 1:b:0:1:1:1
cell:B2:t:Data 2:b:0:1:1:0
sheet:c:2:r:2
border:1:1px solid rgb(0,0,0)
border:2:2px solid rgb(0,0,0)
```

#### Invoice Example (22)
Complete invoice table with headers, data rows, and total row with different border styles.

#### Formula with Borders (21)
```
version:1.5
cell:A1:v:100:b:1:0:0:0
cell:A2:v:200:b:0:0:0:0
cell:A3:v:300:b:0:0:1:0
cell:A4:vtf:n:600:SUM(A1\cA3):b:2:2:2:2
sheet:c:1:r:4
border:1:1px solid rgb(0,0,0)
border:2:2px solid rgb(0,0,0)
```

#### Merged Cells (31)
```
version:1.5
cell:A1:t:Merged Cell with Border:colspan:2:rowspan:2:b:2:2:2:2
cell:A3:t:Regular Cell:b:1:1:1:1
sheet:c:2:r:3
border:1:1px solid rgb(0,0,0)
border:2:3px solid rgb(255,0,0)
```

#### Grid Patterns (36-37)
Examples showing how to create grid-like structures with selective border application.

### Table Border Examples (41-50)

#### Simple Merged Cell (41)
Large merged cell spanning multiple rows and columns with thick borders.

#### Column-Only Borders (42-43)
- **42:** Outer and vertical column borders creating column-separated table
- **43:** Same pattern with alternating row shading in gray

#### Table with Headers (44-45)
- **44:** Merged title row with borders and center alignment
- **45:** Same with added vertical padding (5px) in content cells

#### Full Grid (46)
Complete grid with all borders on every cell and alternating row backgrounds.

#### Themed Tables (47-48)
- **47:** Course schedule with orange theme, merged lunch row, and day columns
- **48:** Comparison matrix with purple/lavender theme and color-coded rows

#### Minimalist Patterns (49-50)
- **49:** Left column borders only with yellow checkerboard backgrounds
- **50:** Left edge borders only with light blue alternating row stripes

## Border Styles Reference

| Style | Description | Example |
|-------|-------------|---------|
| `solid` | Continuous line | `border:1:1px solid rgb(0,0,0)` |
| `dashed` | Dashed line | `border:2:2px dashed rgb(255,0,0)` |
| `dotted` | Dotted line | `border:3:1px dotted rgb(0,0,255)` |
| `double` | Double line | `border:4:3px double rgb(0,0,0)` |

## Color Format Examples

### RGB Format
```
border:1:1px solid rgb(255,0,0)      # Red
border:2:1px solid rgb(0,255,0)      # Green
border:3:1px solid rgb(0,0,255)      # Blue
border:4:1px solid rgb(0,0,0)        # Black
border:5:1px solid rgb(255,255,255)  # White
```

### Hex Format
```
border:1:1px solid #FF0000    # Red
border:2:1px solid #00FF00    # Green
border:3:1px solid #0000FF    # Blue
border:4:1px solid #000000    # Black
border:5:1px solid #FFFFFF    # White
```

## Validation

All files have been validated using the SocialCalc validator:

```bash
node validate_all.js
```

**Result:** 40/40 files valid (100% success rate)

## Usage for Training

These examples can be used to train LLMs on:

1. **Border syntax understanding**
   - Proper border definition format
   - Border reference in cell attributes

2. **Border application patterns**
   - Single vs. multiple sides
   - Border combinations
   - Border ordering (top, right, bottom, left)

3. **Style variations**
   - Different border styles (solid, dashed, dotted, double)
   - Thickness variations (1px-6px)
   - Color formats (RGB and Hex)

4. **Complex scenarios**
   - Multiple cells with coordinated borders
   - Table structures
   - Merged cells
   - Grid patterns
   - Borders with formulas

5. **Best practices**
   - Border reference IDs must be defined before use
   - Border order is always top-right-bottom-left
   - Use 0 for no border on a side
   - Multiple cells can reference the same border definition

## Training Tips

1. **Pattern Recognition:** Examples progress from simple (single border) to complex (tables, merged cells)
2. **Color Awareness:** Mix of RGB and Hex formats teaches flexibility
3. **Style Mastery:** All four border styles demonstrated
4. **Real-world Use Cases:** Invoice and table examples show practical applications
5. **Edge Cases:** No-border cells (16), white borders (38), and grid patterns (36-37)

## Negative Examples

This dataset also includes **10 negative examples** (neg-1.msc through neg-10.msc) that demonstrate common border syntax errors. These examples help train the model to:

- **Identify invalid syntax** - Recognize malformed border definitions
- **Understand validation rules** - Learn what makes borders invalid
- **Debug errors** - Practice error detection and correction
- **Avoid common mistakes** - Learn from real validation failures

### Error Categories Covered

1. **Empty Border Values** (neg-1) - Using :: instead of :0:
2. **Invalid Color Formats** (neg-2) - Named colors vs. rgb() requirement
3. **Structural Errors** (neg-3, neg-6, neg-7) - Trailing colons, double colons, empty definitions
4. **Tuple Length Errors** (neg-5, neg-9, neg-10) - Wrong number of border position values
5. **Reference Errors** (neg-4) - Undefined border IDs
6. **Format Errors** (neg-8) - CSS keywords instead of pixel values

### Negative Examples Files

- **border_negative_training.jsonl** - Training data with error descriptions and corrections
- **NEGATIVE-EXAMPLES.md** - Detailed documentation of each error type
- **validate_negative.js** - Script to verify errors are detected
- **generate_negative_training.js** - Script to generate training data

Each negative example includes:
- The invalid code causing the error
- The correct code that would pass validation
- Validator error message
- Explanation of why it's wrong
- Common causes of the error

## File Naming Convention

- **Positive examples:** 1-50 (numbered for sequential learning)
- **Negative examples:** neg-1 through neg-10 (prefixed with "neg-")

---

**Last Updated:** December 13, 2025
**Validation Status:** 
- ✅ Positive Examples: 50/50 valid (100%)
- ❌ Negative Examples: 0/10 valid (intentionally invalid)
**Total Examples:** 60 (50 positive + 10 negative)

