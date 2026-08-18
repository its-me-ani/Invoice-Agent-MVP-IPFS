# Border Training Dataset - JSON & JSONL Format

## Overview
Successfully converted all 40 border examples to JSON format and created structured training data in JSONL format.

## Files Generated

### JSON Files (40 files)
- **Location:** `json/` directory
- **Format:** Matches invoice format structure with `numsheets`, `currentid`, `sheetArr`
- **Files:** `1.json` through `40.json`
- **Purpose:** Compatible with SocialCalc JSON import/export

**Example Structure:**
```json
{
  "numsheets": 1,
  "currentid": "sheet1",
  "currentname": "sheet1",
  "sheetArr": {
    "sheet1": {
      "sheetstr": {
        "savestr": "version:1.5\ncell:A1:t:...\n..."
      },
      "name": "sheet1",
      "hidden": "0"
    }
  }
}
```

### JSONL Training File
- **File:** `border_training.jsonl`
- **Format:** One JSON object per line
- **Lines:** 40 training examples
- **Structure:** `instruction` → `plan` → `output`

**Example Training Entry:**
```json
{
  "instruction": "Create a cell with a border only on the top side",
  "plan": "Define border → Apply border with b:1:0:0:0 → Top only, other sides zero",
  "output": "cell:A1:t:Single Border - Top Only:b:1:0:0:0"
}
```

## Training Data Structure

### Instruction
Clear, task-oriented description of what to create.

**Examples:**
- "Create a cell with a border only on the top side"
- "Create a cell with different border styles on each side"
- "Create a table header row with thicker bottom border"
- "Create a merged cell with thick red borders"

### Plan
Step-by-step thought process showing how to achieve the instruction.

**Pattern:** `Define → Apply → Result`

**Examples:**
- "Define border → Apply border with b:1:0:0:0 → Top only, other sides zero"
- "Define 4 borders (solid, dashed, dotted, double) → Apply with b:1:2:3:4 → Each side different"
- "Define borders → Merge with colspan:2:rowspan:2 → Apply thick border b:2:2:2:2"

### Output
The actual SocialCalc syntax that implements the instruction.

**Examples:**
- `cell:A1:t:Single Border - Top Only:b:1:0:0:0`
- `border:1:2px dashed rgb(255,0,0)`
- `cell:A1:t:Merged Cell with Border:colspan:2:rowspan:2:b:2:2:2:2`

## Training Categories Covered

### 1. Single Border Sides (Examples 1-4)
- Top only: `b:1:0:0:0`
- Right only: `b:0:1:0:0`
- Bottom only: `b:0:0:1:0`
- Left only: `b:0:0:0:1`

### 2. Border Combinations (Examples 12-13, 27-28)
- Top & Bottom: `b:1:0:1:0`
- Left & Right: `b:0:1:0:1`
- Top & Left: `b:1:0:0:1`
- Bottom & Right: `b:0:1:1:0`

### 3. Border Styles (Examples 5, 8-10)
- Solid: `1px solid rgb(0,0,0)`
- Dashed: `2px dashed rgb(255,0,0)`
- Dotted: `1px dotted rgb(0,0,255)`
- Double: `3px double rgb(0,0,0)`

### 4. Border Thickness (Examples 7, 33, 35)
- Thin: 1px
- Medium: 2-3px
- Thick: 4-5px
- Very thick: 6px

### 5. Color Formats (Examples 11, 34)
- RGB: `rgb(255,0,0)`
- Hex: `#FF0000`

### 6. Mixed Borders (Example 6)
Different style on each side: `b:1:2:3:4`

### 7. Complex Scenarios
- Multiple cells (Example 14)
- Table structures (Example 15, 22)
- Formulas with borders (Example 21)
- Merged cells (Example 31)
- Grid patterns (Examples 36-37)

### 8. Special Cases
- No borders (Example 16): `b:0:0:0:0`
- White borders on colored bg (Example 38)
- Various colors (Examples 17-30, 39-40)

## Usage

### Loading JSON Files
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json/1.json', 'utf8'));
const savestr = data.sheetArr.sheet1.sheetstr.savestr;
```

### Loading JSONL Training Data
```javascript
const fs = require('fs');
const lines = fs.readFileSync('border_training.jsonl', 'utf8').split('\n');
const trainingExamples = lines.filter(l => l.trim()).map(l => JSON.parse(l));

trainingExamples.forEach(example => {
    console.log(`Instruction: ${example.instruction}`);
    console.log(`Plan: ${example.plan}`);
    console.log(`Output: ${example.output}`);
});
```

### For LLM Training
The JSONL format is ready for fine-tuning or few-shot learning:

```python
import json

with open('border_training.jsonl', 'r') as f:
    for line in f:
        example = json.loads(line)
        # Use example['instruction'], example['plan'], example['output']
        # for training
```

## Conversion Script

Run `convert_to_json.js` to regenerate files:

```bash
node convert_to_json.js
```

**Output:**
- Creates `json/` directory with 40 JSON files
- Creates `border_training.jsonl` with training data
- Reports conversion statistics

## Validation

All source .msc files are validated:
```bash
node validate_all.js
```

Result: 100% valid (40/40 files)

## Training Data Quality

### Completeness
- ✅ All 40 examples have instruction-plan-output
- ✅ Progressive difficulty (simple → complex)
- ✅ Diverse scenarios covered

### Instruction Quality
- Clear, specific task descriptions
- Actionable objectives
- Varying complexity levels

### Plan Quality
- Logical step-by-step breakdown
- Shows reasoning process
- Explains parameter choices

### Output Quality
- Valid SocialCalc syntax
- Matches instruction precisely
- Demonstrates correct patterns

## Statistics

| Metric | Value |
|--------|-------|
| Total Examples | 40 |
| JSON Files | 40 |
| JSONL Lines | 40 |
| Border Definitions | 60+ |
| Cell Examples | 90+ |
| Unique Styles | 4 (solid, dashed, dotted, double) |
| Color Formats | 2 (RGB, Hex) |
| Color Variations | 15+ |
| Thickness Range | 1px - 6px |

---

**Generated:** December 13, 2025
**Format Version:** 1.0
**Validation:** ✅ All files valid
