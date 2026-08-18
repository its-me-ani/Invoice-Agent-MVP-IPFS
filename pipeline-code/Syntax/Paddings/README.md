# Paddings Training Dataset

## Overview
This dataset contains 10 examples demonstrating cell padding in SocialCalc using the `layout` property with `padding` values. It covers padding on individual sides, uniform padding, and combinations.

## Statistics
- **Total Examples**: 10 positive examples
- **Validation Status**: ✅ 100% (10/10 valid)
- **Output Files**: 
  - `json/1.json` - `json/10.json` (10 JSON files)
  - `paddings_training.jsonl` (training data)

## Key Features

### Padding Syntax
```
layout:1:padding:TOP RIGHT BOTTOM LEFT;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Padding Format
- **Top**: `10px * * *`
- **Right**: `* 10px * *`
- **Bottom**: `* * 10px *`
- **Left**: `* * * 10px`
- **All sides**: `10px 10px 10px 10px`
- **Shorthand**: Use `*` for unchanged sides

## Example Coverage

| Example | Description | Padding |
|---------|-------------|---------|
| 1 | Top only | 10px * * * |
| 2 | Left only | * * * 15px |
| 3 | All sides uniform | 20px 20px 20px 20px |
| 4 | Top and bottom | 15px * 15px * |
| 5 | Left and right | * 10px * 10px |
| 6 | Different each side | 5px 10px 15px 20px |
| 7 | Large padding | 30px all sides |
| 8 | Multiple cells | Different layouts |
| 9 | With alignment | Padding + vertical-align |
| 10 | Minimal padding | 2px values |

## Training Data Format
Each example in `paddings_training.jsonl` contains:
- **instruction**: Task description for creating padding
- **input**: Empty string (no input required)
- **output**: Complete SocialCalc MSC format
- **plan**: Step-by-step approach for padding layout

Example entry:
```json
{
  "instruction": "Create cell with top padding only",
  "input": "",
  "output": "version:1.5\ncell:A1:t:Simple Padding - Top Only:layout:1\nsheet:c:1:r:1\nlayout:1:padding:10px * * *;vertical-align:*;",
  "plan": "Use layout with padding:10px * * * for top padding only"
}
```

## Usage

### Generate JSON and Training Data
```bash
node convert_to_json.js
```
This creates:
- `json/` directory with 10 JSON files
- `paddings_training.jsonl` with training examples

### Validate Examples
```bash
node validate_all.js
```

### Validate Negative Examples
```bash
node validate_negative.js
```

## Padding Syntax Rules

1. **Layout Declaration**: `layout:1:padding:VALUES;vertical-align:*;`
2. **Cell Reference**: `:layout:1` links cell to layout
3. **Order**: top, right, bottom, left (clockwise from top)
4. **Wildcard**: Use `*` to keep default/no padding
5. **Units**: Specify with `px` (pixels)

## Common Patterns

### Top Padding Only
```
layout:1:padding:10px * * *;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Left Padding Only
```
layout:1:padding:* * * 15px;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Uniform Padding (All Sides)
```
layout:1:padding:20px 20px 20px 20px;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Top and Bottom Padding
```
layout:1:padding:15px * 15px *;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Left and Right Padding
```
layout:1:padding:* 10px * 10px;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Different Padding Each Side
```
layout:1:padding:5px 10px 15px 20px;vertical-align:*;
cell:A1:t:Content:layout:1
```

### Multiple Cells with Different Padding
```
layout:1:padding:10px * * *;vertical-align:*;
layout:2:padding:* * * 15px;vertical-align:*;
cell:A1:t:Top Padded:layout:1
cell:A2:t:Left Padded:layout:2
```

## Use Cases

### 1. Visual Spacing
Add breathing room around cell content for better readability.

### 2. Text Indentation
Use left padding to indent text or create hierarchical structures.

### 3. Header Spacing
Apply top/bottom padding to separate header rows.

### 4. Button-like Cells
Use uniform padding to create button-style cells.

### 5. Form Layouts
Apply padding to form fields for professional appearance.

## Validation Results
All 10 examples passed validation:
- ✅ Proper layout declarations
- ✅ Valid padding syntax (1-3 cells per example)
- ✅ Correct layout references (1-3 layouts)
- ✅ Appropriate sheet dimensions

## Technical Details

### Padding Order
CSS-like clockwise order:
1. **Top** - First value
2. **Right** - Second value
3. **Bottom** - Third value
4. **Left** - Fourth value

### Wildcards
The `*` character means "use default" (typically 0px or no padding).

### Combining with Other Properties
Padding can be combined with:
- `vertical-align` - Vertical positioning
- Color formats
- Font styles
- Borders

## Integration
This dataset is part of the SocialCalc Syntax training collection:
- **Format Text** - HTML/SVG/text formatting
- **Alignments** - Cell alignment options
- **Links** - Hyperlink formatting
- **Multiline Input** - Multi-line text with line breaks
- **Paddings** - Cell padding (this dataset)
