# Format Number Training Examples

This directory contains comprehensive training examples for number formatting in SocialCalc save format.

## Overview

Number formatting allows you to control how numeric values are displayed in cells using the `ntvf` (number text value format) attribute combined with `valueformat` definitions.

## Syntax

```
cell:<coord>:v:<number>:ntvf:<format_id>
valueformat:<format_id>:<pattern>
```

## Format Categories

### 1. Basic Number Formats (Examples 1-4, 19, 22-23, 35-36, 45-46)
- **#,##0** - Comma separators, no decimals
- **#,##0.00** - Comma separators, 2 decimals
- **#,##0.0000** - Comma separators, 4 decimals
- **0** - Plain integer

### 2. Percentage Formats (Examples 5, 20, 28, 32, 41)
- **0.00%** - Percentage with 2 decimal places
- Converts decimal values (0.75 → 75.00%)

### 3. Currency Formats (Examples 6-8, 21, 26-27, 31, 37, 42, 49-50)
- **$#,##0** - Dollar sign, no cents
- **$#,##0.00** - Dollar sign with cents
- **($#,##0.00)** - Negative values in parentheses

### 4. Date Formats (Examples 9-14, 23-24, 29, 33, 38, 43, 47)
- **m/d/yy** - Short date (1/4/06)
- **mm/dd/yyyy** - Full date (01/04/2006)
- **yyyy-mm-dd** - ISO date (2006-01-04)
- **d-mmm-yy** - Short month name (4-Jan-06)
- **dd-mmm-yyyy** - Full month abbreviation (04-Jan-2006)
- **mmmm d, yyyy** - Long format (January 4, 2006)

### 5. Time Formats (Examples 15-18, 25, 34, 39, 44, 48)
- **h\cmm** - 12-hour (12:30)
- **h\cmm AM/PM** - With meridian (12:30 PM)
- **h\cmm\css** - With seconds (12:30:45)
- **hh\cmm\css** - Padded hours (01:30:45)

**Note:** `\c` is the escaped colon for time formats

## Key Concepts

### 1. Cell Attribute: ntvf
- Applied to cell with numeric value
- References a valueformat definition
- Syntax: `cell:A1:v:1234:ntvf:1`

### 2. Valueformat Definition
- Defines the display pattern
- Must be defined if referenced by cell
- Syntax: `valueformat:1:#,##0.00`

### 3. Multiple Formats
- Can define multiple valueformat patterns
- Different cells can use different formats
- Example: One format for items, another for totals

## File Structure

```
Format Number/
├── 1.msc - 50.msc          # Positive examples
├── neg-1.msc - neg-10.msc  # Negative examples
├── convert_to_json.js       # Conversion script
├── validate_all.js          # Validation script
├── validate_negative.js     # Negative validation
├── README.md                # This file
├── SUMMARY.md               # Quick reference
├── NEGATIVE-EXAMPLES.md     # Error patterns
└── json/                    # Generated JSON files
    └── 1.json - 50.json
```

## Common Patterns

### Single Cell with Format
```
version:1.5
cell:A1:v:1234.56:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0.00
```

### Multiple Cells, Same Format
```
version:1.5
cell:A1:v:99.99:ntvf:1
cell:A2:v:149.99:ntvf:1
cell:A3:v:249.99:ntvf:1
sheet:c:1:r:3
valueformat:1:$#,##0.00
```

### Multiple Formats
```
version:1.5
cell:A1:v:1234.56:ntvf:1
cell:B1:v:1234.56:ntvf:2
sheet:c:2:r:1
valueformat:1:$#,##0.00
valueformat:2:#,##0.00
```

## Number Representation

### Date Values
- Stored as serial numbers (days since epoch)
- Example: 38718 = January 4, 2006

### Time Values
- Stored as decimal fractions of a day
- Example: 0.5 = 12:00 noon
- Example: 0.520833 = 12:30 PM

### Percentages
- Stored as decimal values
- Example: 0.75 with format 0.00% displays as 75.00%

## Usage Examples

### Currency Formatting
```bash
# Display prices
cell:A1:v:99.99:ntvf:1
valueformat:1:$#,##0.00
# Shows: $99.99
```

### Date Formatting
```bash
# Display date
cell:A1:v:45292:ntvf:1
valueformat:1:mmmm d, yyyy
# Shows: December 15, 2023
```

### Percentage Formatting
```bash
# Display percentage
cell:A1:v:0.75:ntvf:1
valueformat:1:0.00%
# Shows: 75.00%
```

### Time Formatting
```bash
# Display time
cell:A1:v:0.520833:ntvf:1
valueformat:1:h\cmm AM/PM
# Shows: 12:30 PM
```

## Validation

Run validation scripts to check examples:

```bash
# Validate all positive examples
node validate_all.js

# Validate negative examples
node validate_negative.js
```

## Conversion

Convert .msc files to JSON format:

```bash
node convert_to_json.js
```

This generates:
- Individual JSON files in `json/` directory
- Training data in `format_number_training.jsonl`

## Training Data Format

Each training example includes:
- **instruction**: What to accomplish
- **plan**: How to accomplish it
- **output**: The actual MSC syntax

Example:
```json
{
  "instruction": "Format number with two decimal places",
  "plan": "Apply #,##0.00 format to show number with comma separators and 2 decimals",
  "output": "cell:A1:v:1234.56:ntvf:1\\nvalueformat:1:#,##0.00"
}
```

## Best Practices

1. **Always define valueformat**: Every `ntvf` reference must have a corresponding `valueformat` definition
2. **Use numeric values**: The `ntvf` attribute should only be used with numeric values (`v:`)
3. **Match data type to format**: Use date formats for date values, currency for money, etc.
4. **Consistent formatting**: Apply the same format to related values for consistency
5. **Escape colons in time formats**: Use `\c` instead of `:` in time patterns

## Common Errors

See `NEGATIVE-EXAMPLES.md` for detailed error patterns and how to avoid them.

## Related Documentation

- `SYNTAX.md` - Complete syntax reference
- `SUMMARY.md` - Quick reference guide
- `NEGATIVE-EXAMPLES.md` - Error patterns to avoid
