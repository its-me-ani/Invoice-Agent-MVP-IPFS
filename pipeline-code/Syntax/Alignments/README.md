# Alignment Training Dataset

## Overview

This dataset contains **20 examples** demonstrating horizontal and vertical cell alignment in SocialCalc using `cellformat` (horizontal) and `layout` (vertical) attributes.

## 📊 Dataset Statistics

- **Total Examples**: 20
- **JSON Files**: 20
- **Training Data**: 20 instruction/plan/output triples
- **Validation**: 100% pass rate

## 🎯 Learning Objectives

This dataset trains models to:

1. **Horizontal Alignment**: Use `cellformat` with `left`, `center`, `right`
2. **Vertical Alignment**: Use `layout` with `vertical-align:top/middle/bottom`
3. **Combined Alignment**: Mix horizontal and vertical alignment
4. **Table Layouts**: Apply different alignments to different cells
5. **Professional Formatting**: Align text left, numbers right, titles center

## 📁 File Structure

```
Alignments/
├── 1.msc - 20.msc               # Examples
├── json/                         # Generated JSON files
│   └── 1.json - 20.json
├── convert_to_json.js            # Conversion script
├── validate_all.js               # Validation script
├── alignment_training.jsonl      # Training data
└── README.md                     # This file
```

## 📚 Example Breakdown

### Basic Horizontal Alignment (1-3)

**Example 1**: Left alignment
```
cell:A1:t:Left Aligned:cf:1
cellformat:1:left
```

**Example 2**: Center alignment
```
cell:A1:t:Center Aligned:cf:1
cellformat:1:center
```

**Example 3**: Right alignment
```
cell:A1:t:Right Aligned:cf:1
cellformat:1:right
```

### Basic Vertical Alignment (4-6)

**Example 4**: Top vertical alignment
```
cell:A1:t:Top Aligned:l:1
layout:1:padding:* * * *;vertical-align:top;
```

**Example 5**: Middle vertical alignment
```
cell:A1:t:Middle Aligned:l:1
layout:1:padding:* * * *;vertical-align:middle;
```

**Example 6**: Bottom vertical alignment
```
cell:A1:t:Bottom Aligned:l:1
layout:1:padding:* * * *;vertical-align:bottom;
```

### Combined Alignments (7-9)

**Example 7**: Top-left positioning
```
cell:A1:t:Left + Top:cf:1:l:1
cellformat:1:left
layout:1:padding:* * * *;vertical-align:top;
```

**Example 8**: Perfect centering
```
cell:A1:t:Center + Middle:cf:1:l:1
cellformat:1:center
layout:1:padding:* * * *;vertical-align:middle;
```

**Example 9**: Bottom-right positioning
```
cell:A1:t:Right + Bottom:cf:1:l:1
cellformat:1:right
layout:1:padding:* * * *;vertical-align:bottom;
```

### Practical Table Layouts (10-12)

**Example 10**: Mixed text and number alignment
```
cell:A1:t:Header:cf:1
cell:A2:t:Left Text:cf:1
cell:A3:v:1234:cf:2
cellformat:1:left
cellformat:2:right
```
**Use Case**: Text left, numbers right

**Example 11**: Document with title
```
cell:A1:t:Title:cf:1
cell:A2:t:Subtitle:cf:1
cell:A3:t:Content:cf:2
cellformat:1:center
cellformat:2:left
```
**Use Case**: Centered titles, left-aligned body

**Example 12**: Product table
```
cell:A1:t:Name:cf:1
cell:B1:t:Amount:cf:2
cell:A2:t:Product A:cf:1
cell:B2:v:99.99:cf:2
cellformat:1:left
cellformat:2:right
```
**Use Case**: Product names left, prices right

### Advanced Layouts (13-20)

**Example 13**: Invoice header
- Centered company name with top padding
- Right-aligned invoice number with right padding

**Example 14**: Multi-column header
- Three columns: left, center, right aligned
- All with middle vertical alignment

**Example 15**: Complete 3×3 alignment grid
- Shows all 9 combinations of horizontal/vertical alignment
- Visual reference for positioning options

**Example 16**: Table with merged header
- Centered title spanning 3 columns
- Mixed alignment for data columns

**Example 17**: Text with varied vertical positioning
- Long text with top alignment
- Short text with bottom alignment

**Example 18**: Report layout
- Centered title with large padding
- Right-aligned date and totals

**Example 19**: Employee table
- Headers with padding
- Left-aligned text, right-aligned salaries

**Example 20**: Quarterly report
- Centered title spanning 4 columns
- Centered quarter labels
- Right-aligned numeric data

## 🔑 Key Concepts

### 1. Horizontal Alignment (cellformat)

Controls left-right positioning:

```
cellformat:1:left      # Align to left edge
cellformat:2:center    # Center horizontally
cellformat:3:right     # Align to right edge
```

Usage:
```
cell:A1:t:Text:cf:1
```

### 2. Vertical Alignment (layout)

Controls top-bottom positioning:

```
layout:1:padding:* * * *;vertical-align:top;
layout:2:padding:* * * *;vertical-align:middle;
layout:3:padding:* * * *;vertical-align:bottom;
```

Usage:
```
cell:A1:t:Text:l:1
```

### 3. Combined Alignment

Apply both horizontal and vertical:

```
cell:A1:t:Text:cf:1:l:1
cellformat:1:center
layout:1:padding:* * * *;vertical-align:middle;
```

### 4. Padding in Layouts

Control spacing around content:

```
layout:1:padding:10px * * *;       # Top padding only
layout:2:padding:* 10px * *;       # Right padding only
layout:3:padding:5px 10px 5px 10px;  # All sides
```

Format: `padding:top right bottom left;`
Use `*` for default value

### 5. Best Practices

**Text Alignment**:
- Headers: Center
- Body text: Left
- Numbers/Currency: Right
- Dates: Right

**Vertical Alignment**:
- Headers: Middle (balanced look)
- Data cells: Top or Middle (depends on content height)
- Footer totals: Bottom

**Tables**:
- Column headers: Center or match data alignment
- Text columns: Left
- Numeric columns: Right
- Mixed content: Consider dominant type

## 📝 Real-World Use Cases

### Invoice Layout
```
cell:A1:t:Company Name:cf:1:l:1        # Centered, top padding
cell:A2:t:Invoice #12345:cf:2:l:2      # Right-aligned, right padding
cellformat:1:center
cellformat:2:right
layout:1:padding:10px * * *;vertical-align:top;
layout:2:padding:* 10px * *;vertical-align:top;
```

### Data Table
```
cell:A1:t:Name:cf:1
cell:B1:t:Amount:cf:2
cell:A2:t:Item 1:cf:1
cell:B2:v:99.99:cf:2
cellformat:1:left      # Text left
cellformat:2:right     # Numbers right
```

### Report Header
```
cell:A1:t:QUARTERLY REPORT:cf:1:l:1
cellformat:1:center
layout:1:padding:15px * 10px *;vertical-align:middle;
```

## 🎓 Training Data Structure

Each example includes:

```json
{
  "instruction": "Create cell with center horizontal alignment",
  "input": "",
  "output": "version:1.5\ncell:A1:t:Center Aligned:cf:1\ncellformat:1:center\nsheet:c:1:r:1",
  "plan": "Apply cellformat with center alignment to text cell"
}
```

## 🔧 Usage

### Generate JSON Files
```bash
node convert_to_json.js
```

### Validate Examples
```bash
node validate_all.js
```

## 📈 Validation Results

- **Total**: 20 files
- **Valid**: 20 ✅
- **Invalid**: 0 ❌
- **Success Rate**: 100%

## 🎯 Alignment Reference

### Horizontal (cellformat)

| Value | Description | Best For |
|-------|-------------|----------|
| `left` | Left-aligned | Text, labels, names |
| `center` | Centered | Titles, headers, short labels |
| `right` | Right-aligned | Numbers, dates, amounts |

### Vertical (layout vertical-align)

| Value | Description | Best For |
|-------|-------------|----------|
| `top` | Top-aligned | Headers, first lines |
| `middle` | Vertically centered | Icons, single-line text |
| `bottom` | Bottom-aligned | Footer text, totals |

## 💡 Tips

1. **Text vs Numbers**: Always left-align text, right-align numbers
2. **Headers**: Center or match data column alignment
3. **Titles**: Center with appropriate padding
4. **Consistency**: Use same alignment for similar content types
5. **Readability**: Proper alignment improves data scanning
6. **Professional Look**: Right-align currency and numeric values

## 🚀 Ready for Training

All examples validated and ready for ML model training to learn:
- Horizontal alignment with cellformat
- Vertical alignment with layout
- Combined alignment techniques
- Professional table formatting
- Best practices for different content types

---

**Dataset Complete**: Ready for training! 🎉
