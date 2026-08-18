# Format Number - Quick Reference

## Basic Syntax

```
cell:A1:v:<number>:ntvf:<id>
valueformat:<id>:<pattern>
```

## Common Patterns

### Numbers
| Pattern | Output | Example |
|---------|--------|---------|
| `#,##0` | 1,234 | Basic thousands separator |
| `#,##0.00` | 1,234.56 | Two decimal places |
| `#,##0.0000` | 1,234.5678 | Four decimal places |
| `0` | 1234 | No formatting |

### Currency
| Pattern | Output | Example |
|---------|--------|---------|
| `$#,##0` | $1,234 | No cents |
| `$#,##0.00` | $1,234.56 | With cents |
| `($#,##0.00)` | ($1,234.56) | Negative in parentheses |

### Percentage
| Pattern | Output | Example |
|---------|--------|---------|
| `0.00%` | 75.00% | Two decimal percentage |
| `0%` | 75% | Integer percentage |

### Dates
| Pattern | Output | Example |
|---------|--------|---------|
| `m/d/yy` | 1/4/06 | Short date |
| `mm/dd/yyyy` | 01/04/2006 | Full date |
| `yyyy-mm-dd` | 2006-01-04 | ISO date |
| `d-mmm-yy` | 4-Jan-06 | With short month |
| `dd-mmm-yyyy` | 04-Jan-2006 | With full month abbr |
| `mmmm d, yyyy` | January 4, 2006 | Long format |

### Time
| Pattern | Output | Example |
|---------|--------|---------|
| `h\cmm` | 12:30 | 12-hour |
| `h\cmm AM/PM` | 12:30 PM | With meridian |
| `h\cmm\css` | 12:30:45 | With seconds |
| `hh\cmm\css` | 01:30:45 | Padded hours |

**Note:** `\c` = escaped colon in time formats

## File Organization

```
1-4     Basic number formats
5       Percentage
6-8     Currency formats
9-14    Date formats
15-18   Time formats
19-50   Mixed and complex examples
```

## Example by Category

### Basic Number (1.msc)
```
version:1.5
cell:A1:v:1234:ntvf:1
sheet:c:1:r:1
valueformat:1:#,##0
```

### Currency (7.msc)
```
version:1.5
cell:A1:v:1234.56:ntvf:1
sheet:c:1:r:1
valueformat:1:$#,##0.00
```

### Date (10.msc)
```
version:1.5
cell:A1:v:38718:ntvf:1
sheet:c:1:r:1
valueformat:1:mm/dd/yyyy
```

### Time (16.msc)
```
version:1.5
cell:A1:v:0.520833:ntvf:1
sheet:c:1:r:1
valueformat:1:h\cmm AM/PM
```

### Multiple Formats (30.msc)
```
version:1.5
cell:A1:v:12345.678:ntvf:1
cell:A2:v:98765.432:ntvf:2
sheet:c:1:r:2
valueformat:1:#,##0.00
valueformat:2:#,##0.0000
```

## Value Representations

| Type | Storage | Display Example |
|------|---------|-----------------|
| Number | 1234.56 | 1,234.56 |
| Date | 38718 | 01/04/2006 |
| Time | 0.5 | 12:00 PM |
| Percentage | 0.75 | 75.00% |

## Validation

```bash
# Check all examples
node validate_all.js

# Check negative examples
node validate_negative.js

# Convert to JSON
node convert_to_json.js
```

## Common Errors to Avoid

❌ Missing valueformat definition
❌ Undefined format ID reference
❌ Text value with number format
❌ Empty format pattern
❌ Duplicate ntvf attributes
❌ Non-numeric format ID
❌ Negative format ID

✅ Always define referenced formats
✅ Use numeric values (v:) with ntvf
✅ Use positive integer format IDs
✅ Provide valid format patterns
✅ One ntvf per cell

## Training Data

50 positive examples demonstrating:
- All major format types
- Single and multiple formats
- Simple and complex patterns
- Real-world use cases

10 negative examples showing:
- Common error patterns
- Invalid syntax
- Missing definitions
- Type mismatches
