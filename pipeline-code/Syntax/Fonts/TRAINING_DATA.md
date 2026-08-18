# Font Properties - Training Data Documentation

## Overview

This document describes the training data format and structure for the **Font Properties** dataset.

## Dataset Statistics

- **Total Training Examples:** 50
- **Format:** JSONL (JSON Lines)
- **File:** `font_training.jsonl`
- **Validation:** ✅ 100% valid examples

## Training Data Structure

Each training example consists of three fields:

```json
{
  "instruction": "What the user wants to accomplish",
  "plan": "Step-by-step approach to solve the problem",
  "output": "Key line(s) demonstrating the solution"
}
```

### Field Descriptions

| Field | Purpose | Content Type |
|-------|---------|--------------|
| `instruction` | User's request or goal | Natural language question/command |
| `plan` | Solution strategy | Step-by-step approach with → separators |
| `output` | Expected result | SocialCalc syntax line(s) |

## Example Entries

### Example 1: Basic Bold Text
```json
{
  "instruction": "Create a cell with bold text",
  "plan": "Define font with bold weight → Apply font with f:1 → Use 'normal bold 12pt Arial'",
  "output": "cell:A1:t:Bold Text:f:1"
}
```

### Example 2: Italic Text
```json
{
  "instruction": "Create a cell with italic text",
  "plan": "Define font with italic style → Apply font with f:1 → Use 'italic normal 12pt Arial'",
  "output": "cell:A1:t:Italic Text:f:1"
}
```

### Example 3: Large Font
```json
{
  "instruction": "Create a cell with large 18pt font",
  "plan": "Define font with 18pt size → Apply to cell → Larger text emphasis",
  "output": "font:1:normal normal 18pt Arial"
}
```

### Example 4: Different Font Family
```json
{
  "instruction": "Create a cell with Times New Roman font",
  "plan": "Define font with Times New Roman family → Apply to cell → Serif font style",
  "output": "font:1:normal normal 12pt 'Times New Roman',serif"
}
```

### Example 5: Wildcard Usage
```json
{
  "instruction": "Create a cell with wildcard style (use default)",
  "plan": "Define font with * for style → Bold weight specified → Use default style",
  "output": "font:1:* bold 12pt Arial"
}
```

### Example 6: Multiple Fonts
```json
{
  "instruction": "Create multiple cells with different font styles",
  "plan": "Define 2 fonts → Apply font 1 to first cell → Apply font 2 to second cell → Different styling",
  "output": "cell:A1:t:Multiple Fonts:f:1"
}
```

### Example 7: Document Hierarchy
```json
{
  "instruction": "Create a document structure with header, body, and footer fonts",
  "plan": "Define 3 fonts (large bold, normal, small italic) → Apply to respective cells → Document hierarchy",
  "output": "font:1:normal bold 18pt Arial"
}
```

## Coverage Matrix

### Font Styles (3 examples)
| Example # | Style | Description |
|-----------|-------|-------------|
| 1 | normal bold | Bold text |
| 2 | italic normal | Italic text |
| 3 | italic bold | Bold italic |

### Font Sizes (15 examples)
| Example # | Size | Type | Description |
|-----------|------|------|-------------|
| 4 | 18pt | Points | Large |
| 5 | 8pt | Points | Small |
| 9 | x-large | Named | Extra large named |
| 10 | medium | Named | Medium named |
| 11 | small | Named | Small named |
| 12 | large | Named | Large named |
| 13 | 14px | Pixels | Pixel-based |
| 30-34 | 6pt-72pt | Points | Range of point sizes |
| 35-37 | 8px-36px | Pixels | Range of pixel sizes |

### Font Families (20+ examples)
| Example # | Family | Category |
|-----------|--------|----------|
| 6 | Times New Roman | Serif |
| 7 | Verdana | Sans-serif |
| 8 | Courier New | Monospace |
| 14 | Helvetica | Sans-serif |
| 25 | Georgia | Serif |
| 26 | Tahoma | Sans-serif |
| 27 | Trebuchet MS | Sans-serif |
| 28 | Impact | Display |
| 29 | Comic Sans MS | Cursive |
| 40-43 | Font stacks | With fallbacks |
| 46-47 | Palatino, Garamond | Serif |

### Wildcards (5 examples)
| Example # | Wildcard Position | Description |
|-----------|------------------|-------------|
| 18 | Style | Use default style |
| 19 | Weight | Use default weight |
| 20 | Size | Use default size |
| 21 | Family | Use default family |
| 22 | All | All wildcards |

### Multi-Font Documents (12 examples)
| Example # | Use Case | Fonts |
|-----------|----------|-------|
| 23 | Multiple styles | 2 |
| 24 | Document structure | 3 |
| 38 | Table formatting | 2 |
| 39 | Hierarchy | 4 |
| 44 | Form layout | 2 |
| 45 | Priority levels | 3 |
| 48 | Book layout | 3 |
| 49 | Code formatting | 2 |
| 50 | Company branding | 3 |

## Training Categories

### 1. Basic Font Properties (30%)
- Simple bold, italic, combinations
- Single font per document
- Standard sizes and families

### 2. Font Variations (25%)
- Different sizes (point, pixel, named)
- Various font families
- Style and weight combinations

### 3. Advanced Usage (25%)
- Wildcard defaults
- Font stacks with fallbacks
- Pixel vs point sizes

### 4. Real-World Scenarios (20%)
- Document hierarchies
- Table formatting
- Form layouts
- Code snippets
- Company branding

## Instruction Patterns

### Pattern 1: Simple Creation
```
"Create a cell with [property]"
"Create a cell with bold text"
"Create a cell with italic text"
```

### Pattern 2: Size Specification
```
"Create a cell with [size] font"
"Create a cell with large 18pt font"
"Create a cell with small 8pt font"
```

### Pattern 3: Family Specification
```
"Create a cell with [family] font"
"Create a cell with Times New Roman font"
"Create a cell with Courier New monospace font"
```

### Pattern 4: Multiple Properties
```
"Create a cell with [size] [style] [weight] [family]"
"Create a cell with large bold text"
"Create a cell with small bold italic text"
```

### Pattern 5: Multi-Element Layouts
```
"Create [structure] with [description]"
"Create a document structure with header, body, and footer fonts"
"Create a table with bold headers and normal data rows"
```

### Pattern 6: Wildcard Usage
```
"Create a cell with wildcard [component]"
"Create a cell with wildcard style (use default)"
"Create a cell with all wildcards"
```

## Plan Structure Patterns

### Simple Plans
```
"Define font → Apply to cell → [Description]"
```

### Multi-Step Plans
```
"Define font with [property] → Apply font with f:N → [Result]"
```

### Complex Plans
```
"Define N fonts → Apply font X to [element] → Apply font Y to [element] → [Purpose]"
```

## Output Patterns

### Pattern 1: Cell Reference
```
"cell:A1:t:Text:f:1"
```

### Pattern 2: Font Definition
```
"font:1:normal bold 12pt Arial"
```

### Pattern 3: Complex Font
```
"font:1:italic bold 18pt Verdana,Geneva,sans-serif"
```

## Usage in Fine-Tuning

### Model Training
```python
# Load training data
with open('font_training.jsonl', 'r') as f:
    training_data = [json.loads(line) for line in f]

# Each example can be used for:
# 1. Instruction following
# 2. Syntax generation
# 3. Planning/reasoning
```

### Prompt Format
```
Instruction: {instruction}

Plan: {plan}

Output: {output}
```

## Quality Metrics

- **Instruction Clarity:** All instructions are clear, specific tasks
- **Plan Completeness:** All plans include necessary steps
- **Output Correctness:** All outputs validated by parser
- **Coverage:** Comprehensive coverage of font properties
- **Diversity:** Wide variety of fonts, sizes, and use cases

## Generating More Training Data

To create additional training examples:

1. Create new .msc files following existing patterns
2. Validate using `validate_all.js`
3. Run `convert_to_json.js` to regenerate JSONL
4. Verify output format and content

## Related Files

- **font_training.jsonl** - Main training data file
- **json/*.json** - Individual example JSON files
- **1-50.msc** - Source .msc files
- **validate_all.js** - Validation script
- **convert_to_json.js** - Conversion script

## Example Query

View specific training example:
```bash
# Get example 15
sed -n '15p' font_training.jsonl | jq .
```

Expected output:
```json
{
  "instruction": "Create a cell with large bold text",
  "plan": "Define font with 16pt size and bold weight → Apply to cell → Emphasized large text",
  "output": "font:1:normal bold 16pt Arial"
}
```

---

**Total Training Examples:** 50  
**Format Version:** 1.0  
**Last Updated:** December 2024
