# Dimensions & Merging Dataset - Summary

## 📊 Dataset Overview

**Purpose:** Training examples for cell merging (colspan/rowspan) in SocialCalc format  
**Status:** ✅ Complete and Validated  
**Created:** December 2024  
**Format Version:** SocialCalc 1.5

## 📈 Statistics

| Metric | Count | Status |
|--------|-------|--------|
| Positive Examples | 50 | ✅ 100% Valid |
| Negative Examples | 10 | ✅ 100% Invalid |
| Total Training Files | 60 | ✅ Complete |
| JSON Files Generated | 50 | ✅ Complete |
| JSONL Training File | 1 | ✅ Generated |

## 📁 Directory Structure

```
dimensions-merging/
├── 1.msc - 50.msc          # Positive examples (valid merges)
├── neg-1.msc - neg-10.msc  # Negative examples (error cases)
├── json/                   # JSON format of positive examples
│   └── 1.json - 50.json
├── dimensions_training.jsonl  # Training dataset
├── validate_all.js         # Validation script (positive)
├── validate_negative.js    # Validation script (negative)
├── convert_to_json.js      # Conversion script
├── README.md               # Main documentation
├── NEGATIVE-EXAMPLES.md    # Error documentation
└── SUMMARY.md              # This file
```

## 🎯 Coverage Matrix

### Merge Types
- ✅ Horizontal only (colspan)
- ✅ Vertical only (rowspan)
- ✅ Combined (colspan + rowspan)

### Merge Sizes
- ✅ Small: 2x1, 1x2, 2x2, 3x3
- ✅ Medium: 4x2, 2x4, 4x4, 5x5
- ✅ Large: 6+ columns/rows, 10x1, 1x10, 12x1, 1x12

### Layout Patterns
- ✅ Table headers (spanning columns)
- ✅ Sidebars (spanning rows)
- ✅ Banners (full-width)
- ✅ Navigation (full-height)
- ✅ Dashboards (mixed sections)
- ✅ Calendars (days/hours)
- ✅ Invoices (company info, items)
- ✅ Reports (sections, totals)
- ✅ Forms (labels, groups)
- ✅ Page layouts (header, content, footer)

### Error Cases Covered
- ✅ Invalid attributes
- ✅ Missing values
- ✅ Non-numeric values
- ✅ Zero/negative dimensions
- ✅ Syntax errors (double colons, trailing colons)

## 🔑 Key Concepts

### Merge Formula
For a merge with `colspan:X` and `rowspan:Y`:
- **Total cells affected:** X × Y
- **Empty cells needed:** (X × Y) - 1

### Critical Rules
1. **All covered cells must be marked empty**
   ```
   cell:A1:t:Text:colspan:2:rowspan:2
   cell:B1:t:     # Must mark empty
   cell:A2:t:     # Must mark empty
   cell:B2:t:     # Must mark empty
   ```

2. **Order matters:** colspan before rowspan
   ```
   ✅ cell:A1:t:Text:colspan:2:rowspan:3
   ❌ cell:A1:t:Text:rowspan:3:colspan:2  # Wrong order
   ```

3. **Values must be positive integers**
   ```
   ✅ colspan:2
   ❌ colspan:0    # Must be ≥ 1
   ❌ colspan:-1   # No negatives
   ❌ colspan:abc  # Must be numeric
   ```

## 📝 Example Complexity Progression

### Level 1: Basic (Examples 1-10)
Simple single-direction merges and small grids
```
1.msc:  cell:A1:t:Text:colspan:2          # 2 columns
2.msc:  cell:A1:t:Text:rowspan:2          # 2 rows
3.msc:  cell:A1:t:Text:colspan:2:rowspan:2  # 2x2 grid
```

### Level 2: Tables (Examples 11-20)
Structured layouts with headers and sections
```
18.msc: Main header (5 cols) + Sub-headers (2+3 cols)
20.msc: 3x3 center with surrounding cells
```

### Level 3: Business (Examples 21-30)
Real-world document structures
```
21.msc: Invoice with item descriptions
29.msc: Dashboard with metric sections
```

### Level 4: Complex (Examples 31-50)
Large-scale layouts and nested structures
```
43.msc: 5x5 maximum square merge (24 empty cells)
50.msc: Complete web layout (nav, header, main, sidebar, footer)
```

## 🧪 Validation Results

### Positive Examples
```bash
$ node validate_all.js
Total files: 50
Valid: 50 ✅
Invalid: 0 ❌
Success rate: 100.0%
```

### Negative Examples
```bash
$ node validate_negative.js
Total negative examples: 10
Correctly invalid: 10 ✅
Unexpectedly valid: 0 ❌
Success rate: 100.0%
```

## 🎓 Training Data Format

Each entry in `dimensions_training.jsonl`:
```json
{
  "instruction": "Natural language task description",
  "input": "",
  "output": "Complete SocialCalc format with merge",
  "plan": "Step-by-step merge implementation logic"
}
```

## 🚀 Quick Start

### Validate All Examples
```bash
node validate_all.js       # Check positive examples
node validate_negative.js  # Check negative examples
```

### Generate Training Data
```bash
node convert_to_json.js    # Creates JSON files and JSONL
```

### View Examples
```bash
cat 1.msc                  # Simple horizontal merge
cat 3.msc                  # 2x2 grid merge
cat 50.msc                 # Complex layout
cat neg-1.msc              # Error example
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete guide with syntax, rules, and examples |
| `NEGATIVE-EXAMPLES.md` | Error catalog with explanations |
| `SUMMARY.md` | This overview document |

## 🔍 Important Notes

1. **Empty cells are mandatory:** When a cell is covered by a merge, it MUST be defined with `cell:XX:t:`

2. **Coordinate system:** Columns use letters (A-Z, AA-ZZ), rows use numbers (1-999+)

3. **Sheet dimensions:** `sheet:c:X:r:Y` must encompass all merged areas

4. **No overlap:** Merged cells cannot overlap with other merges

5. **Validation required:** Always validate after creating or editing merge examples

## ✅ Completion Checklist

- [x] 50 positive examples created
- [x] 10 negative examples created
- [x] All positive examples validate successfully
- [x] All negative examples correctly fail validation
- [x] JSON files generated (50)
- [x] JSONL training file created
- [x] README documentation complete
- [x] Negative examples documented
- [x] Validation scripts working
- [x] Conversion script functional

## 🎉 Ready for Use

This dataset is **production-ready** for:
- Training language models on cell merging
- Testing SocialCalc parsers
- Validating merge implementations
- Teaching merge syntax and patterns
- Error handling development

---

**Last Updated:** December 13, 2024  
**Validator:** SocialCalc Format Validator v1.5  
**Total Size:** 60 examples (50 valid + 10 invalid)  
**Quality Status:** ✅ All Tests Passing
