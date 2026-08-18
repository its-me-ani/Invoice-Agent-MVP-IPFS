# Format Number Dataset - Creation Summary

## ✅ Completed Tasks

### 1. Positive Training Examples (50 files)
Created comprehensive examples covering:
- **Basic Number Formats** (Examples 1-4, 19, 22-23, 35-36, 45-46)
  - Comma separators: `#,##0`
  - Decimal precision: `#,##0.00`, `#,##0.0000`
  - Plain integers: `0`

- **Percentage Formats** (Examples 5, 20, 28, 32, 41)
  - Standard percentage: `0.00%`
  - Various decimal values to percentage conversion

- **Currency Formats** (Examples 6-8, 21, 26-27, 31, 37, 42, 49-50)
  - Dollar formatting: `$#,##0`, `$#,##0.00`
  - Negative amounts: `($#,##0.00)`
  - Mixed currency and plain number formats

- **Date Formats** (Examples 9-14, 23-24, 29, 33, 38, 43, 47)
  - Short: `m/d/yy`
  - Full: `mm/dd/yyyy`
  - ISO: `yyyy-mm-dd`
  - With month names: `d-mmm-yy`, `dd-mmm-yyyy`, `mmmm d, yyyy`

- **Time Formats** (Examples 15-18, 25, 34, 39, 44, 48)
  - 12-hour: `h\cmm`
  - With AM/PM: `h\cmm AM/PM`
  - With seconds: `h\cmm\css`, `hh\cmm\css`

### 2. Negative Examples (10 files)
Created error demonstrations for:
1. **neg-1.msc**: Undefined format reference (ntvf:99 with no valueformat:99)
2. **neg-2.msc**: Missing valueformat definition
3. **neg-3.msc**: Non-numeric format ID (abc)
4. **neg-4.msc**: Empty format pattern
5. **neg-5.msc**: Duplicate ntvf attributes
6. **neg-6.msc**: Text value with number format
7. **neg-7.msc**: Negative format ID
8. **neg-8.msc**: Invalid format pattern (##,##,##0)
9. **neg-9.msc**: Mismatched format reference
10. **neg-10.msc**: Double percent signs (0.00%%)

### 3. Scripts Created
- ✅ **convert_to_json.js**: Converts .msc files to JSON format with proper structure
- ✅ **validate_all.js**: Validates all positive examples for correctness
- ✅ **validate_negative.js**: Verifies negative examples demonstrate expected errors

### 4. Documentation
- ✅ **README.md**: Comprehensive guide with syntax, examples, and best practices
- ✅ **SUMMARY.md**: Quick reference with common patterns and examples
- ✅ **NEGATIVE-EXAMPLES.md**: Detailed explanation of each error pattern

### 5. Generated Files
- ✅ **50 JSON files**: In `json/` directory with correct format structure
- ✅ **format_number_training.jsonl**: Training data with instruction/plan/output triples

## 📊 Validation Results

### Positive Examples
```
Total files: 50
Passed: 50 ✅
Failed: 0
```

### Negative Examples
```
Total examples: 10
Valid (demonstrates error): 10 ✅
Invalid: 0
```

## 📁 Directory Structure

```
Format Number/
├── 1.msc - 50.msc                    # Positive examples
├── neg-1.msc - neg-10.msc            # Negative examples
├── convert_to_json.js                # Conversion script
├── validate_all.js                   # Validation script
├── validate_negative.js              # Negative validation
├── format_number_training.jsonl      # Training data (50 examples)
├── README.md                         # Main documentation
├── SUMMARY.md                        # Quick reference
├── NEGATIVE-EXAMPLES.md              # Error patterns
└── json/                             # Generated JSON files
    ├── 1.json - 50.json              # 50 JSON format files
```

## 🎯 Key Features

### Comprehensive Coverage
- All major number format types (numbers, currency, dates, times, percentages)
- Simple and complex patterns
- Single and multiple format definitions
- Real-world use cases

### Quality Assurance
- All examples validated for syntax correctness
- Negative examples verified to demonstrate intended errors
- Consistent structure matching Borders/Fonts format
- Complete documentation with examples

### Training Data
- 50 instruction/plan/output triples
- Each example includes:
  - Natural language instruction
  - Step-by-step plan
  - Actual MSC syntax output

## 🔧 Usage

### Validate Examples
```bash
node validate_all.js          # Check positive examples
node validate_negative.js     # Check negative examples
```

### Generate JSON Files
```bash
node convert_to_json.js       # Creates JSON files and training data
```

## 📝 Syntax Reference

### Basic Pattern
```
cell:A1:v:<number>:ntvf:<id>
valueformat:<id>:<pattern>
```

### Key Attribute
- **ntvf**: Number Text Value Format - applies formatting to numeric cell values
- Must reference a defined `valueformat` line

### Common Patterns
- Numbers: `#,##0`, `#,##0.00`, `#,##0.0000`
- Currency: `$#,##0`, `$#,##0.00`, `($#,##0)`
- Percentage: `0.00%`
- Dates: `m/d/yy`, `mm/dd/yyyy`, `yyyy-mm-dd`
- Times: `h\cmm`, `h\cmm AM/PM`, `hh\cmm\css`

## ✨ Best Practices

1. ✅ Always define valueformat for every ntvf reference
2. ✅ Use numeric values (v:) with ntvf attribute
3. ✅ Use positive integer format IDs
4. ✅ Provide non-empty format patterns
5. ✅ Apply one ntvf per cell
6. ✅ Match data type to format (dates for dates, currency for money, etc.)
7. ✅ Use consistent formatting for related values

## 🎓 Training Data Quality

Each of the 50 training examples includes:
- **Instruction**: Clear, natural language description
- **Plan**: Detailed explanation of the approach
- **Output**: Correct MSC syntax with proper formatting

Example:
```json
{
  "instruction": "Format number with two decimal places",
  "plan": "Apply #,##0.00 format to show number with comma separators and 2 decimals",
  "output": "cell:A1:v:1234.56:ntvf:1\nvalueformat:1:#,##0.00"
}
```

## 🚀 Ready for Use

All files have been created, validated, and are ready for:
- Model training
- Dataset preparation
- Testing and validation
- Reference documentation

---

**Created**: December 14, 2025
**Total Files**: 60 .msc files + 50 JSON files + scripts + documentation
**Training Examples**: 50 positive + 10 negative
**Status**: ✅ Complete and Validated
