# Border Training Dataset - Complete Summary

## Dataset Overview

This directory contains a comprehensive training dataset for SocialCalc border properties, including both **positive examples** (correct syntax) and **negative examples** (common errors).

### Dataset Composition

| Type | Count | Status | Purpose |
|------|-------|--------|---------|
| Positive Examples | 50 | ✅ All Valid | Teach correct border syntax |
| Negative Examples | 10 | ❌ All Invalid | Teach error detection |
| **Total** | **60** | - | Comprehensive training |

## Positive Examples (1-50)

### Files
- `1.msc` through `50.msc` - Validated SocialCalc files
- `json/1.json` through `json/50.json` - JSON format conversions
- `border_training.jsonl` - Training data with instructions

### Coverage
- ✅ All border sides (top, right, bottom, left)
- ✅ All border styles (solid, dashed, dotted, double)
- ✅ Multiple thicknesses (1px - 6px)
- ✅ Color formats (RGB and Hex)
- ✅ Simple to complex tables
- ✅ Merged cells
- ✅ Grid patterns

### Validation Status
```
50/50 files valid (100%)
```

## Negative Examples (neg-1 through neg-10)

### Files
- `neg-1.msc` through `neg-10.msc` - Invalid SocialCalc files with specific errors
- `border_negative_training.jsonl` - Error descriptions and corrections
- `NEGATIVE-EXAMPLES.md` - Detailed error documentation

### Error Types Covered

1. **Empty Border Values** (neg-1)
   - Error: `b::1::1`
   - Fix: `b:0:1:0:1`
   - Common in files 42-50 during dataset creation

2. **Invalid Color Format** (neg-2)
   - Error: `border:2:2px dashed blue`
   - Fix: `border:2:2px dashed rgb(0,0,255)`
   - Named colors not supported

3. **Trailing Colon** (neg-3)
   - Error: `b:1:1:1:1:`
   - Fix: `b:1:1:1:1`
   - String concatenation mistake

4. **Undefined Border Reference** (neg-4)
   - Error: `b:5:1:1:1` (border:5 not defined)
   - Fix: Define border:5 or use existing ID
   - Copy-paste without definitions

5. **Incomplete Border Tuple - 2 Values** (neg-5)
   - Error: `b:1:1`
   - Fix: `b:1:1:0:0`
   - Missing bottom and left positions

6. **Double Colon Before Attribute** (neg-6)
   - Error: `b:1:1:1:1::bg:2`
   - Fix: `b:1:1:1:1:bg:2`
   - Regex replacement error

7. **Empty Border Definition** (neg-7)
   - Error: `border:2:`
   - Fix: `border:2:1px solid rgb(0,0,0)`
   - Incomplete definition

8. **Invalid Border Thickness** (neg-8)
   - Error: `border:1:thick solid rgb(0,0,0)`
   - Fix: `border:1:3px solid rgb(0,0,0)`
   - CSS keyword not supported

9. **Too Many Border Values** (neg-9)
   - Error: `b:1:1:1:1:1`
   - Fix: `b:1:1:1:1`
   - Extra value added

10. **Incomplete Border Tuple - 3 Values** (neg-10)
    - Error: `b:1:1:1`
    - Fix: `b:1:1:1:0`
    - Missing left position

### Validation Status
```
0/10 files valid (0% - intentionally invalid)
11 total errors detected
```

## Training Data Files

### Positive Training
**File:** `border_training.jsonl`  
**Format:**
```json
{
  "instruction": "Create a table with...",
  "plan": "Define border styles → Apply to cells → ...",
  "output": "version:1.5\ncell:A1:..."
}
```
**Lines:** 50 (one per positive example)

### Negative Training
**File:** `border_negative_training.jsonl`  
**Format:**
```json
{
  "instruction": "Identify and fix...",
  "error_type": "Empty border values...",
  "invalid_code": "cell:A1:b::1::1",
  "valid_code": "cell:A1:b:0:1:0:1",
  "explanation": "Empty border positions must...",
  "validator_message": "Cell A1: top border not defined",
  "full_context": "version:1.5\n..."
}
```
**Lines:** 10 (one per negative example)

## Scripts and Tools

### Validation Scripts
- `validator.js` - Comprehensive SocialCalc validator (in parent directory)
- `validate_all.js` - Batch validation for positive examples
- `validate_negative.js` - Validation checker for negative examples

### Conversion Scripts
- `convert_to_json.js` - MSC → JSON + JSONL training data
- `generate_negative_training.js` - Create negative example training data

### Usage Examples

#### Validate All Positive Examples
```bash
node validate_all.js
```

#### Validate Negative Examples
```bash
node validate_negative.js
```

#### Generate Positive Training Data
```bash
node convert_to_json.js
```

#### Generate Negative Training Data
```bash
node generate_negative_training.js
```

## Learning Progression

### For LLM Training

1. **Start with Positive Examples (1-20)**
   - Basic border syntax
   - Single sides and combinations
   - Different styles and colors

2. **Progress to Complex Patterns (21-40)**
   - Multiple colors
   - Tables and grids
   - Advanced styling

3. **Study Table Layouts (41-50)**
   - Real-world table structures
   - Merged cells
   - Selective borders

4. **Learn from Errors (neg-1 to neg-10)**
   - Common mistakes
   - Validation rules
   - Error correction

## Error Insights from Dataset Creation

### Most Common Issues
1. **Empty border values** - Fixed with `s/::/.:0:/g` regex
2. **Trailing colons** - Removed with pattern matching
3. **Double colons** - Fixed with `s/::/:/g` after borders
4. **Invalid color formats** - Converted CSS to rgb()

### Lessons Learned
- Always use `0` for no border, never leave empty
- Border tuple must have exactly 4 values
- All border IDs must be defined before use
- Colors must be in rgb(R,G,B) or #RRGGBB format
- Thickness must be pixel values (1px, 2px, etc.)
- Border styles: solid, dashed, dotted, double only

## Documentation Files

- **README.md** - Main dataset documentation
- **NEGATIVE-EXAMPLES.md** - Detailed error catalog
- **SUMMARY.md** - This file - complete overview

## Statistics

### Coverage Metrics
- ✅ Border Sides: 4/4 (100%)
- ✅ Border Styles: 4/4 (100%)
- ✅ Color Formats: 2/2 (RGB + Hex)
- ✅ Thickness Range: 1px-6px
- ✅ Error Types: 10 common errors

### File Counts
- MSC Files (positive): 50
- MSC Files (negative): 10
- JSON Files: 50
- JSONL Files: 2 (positive + negative)
- Documentation Files: 3
- Script Files: 5

### Validation Metrics
- Positive Examples Valid: 50/50 (100%)
- Negative Examples Invalid: 10/10 (100%)
- Total Errors Catalogued: 11 unique error types
- Error Detection Rate: 100%

---

**Created:** December 13, 2025  
**Total Training Examples:** 60  
**Validation Tool:** SocialCalc Validator v1.0  
**Status:** ✅ Complete and Ready for Training
