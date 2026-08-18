# Formula Training Dataset - Quick Summary

## 📊 Dataset Statistics
- **Total Examples**: 60 files
- **Positive Examples**: 50 valid formulas (100% validation success)
- **Negative Examples**: 10 syntax errors (all produce expected errors)
- **Total Formulas**: 59 formula expressions
- **Function Categories**: 10 categories covered

## 🎯 Coverage

### Arithmetic (4 examples)
Addition, Subtraction, Multiplication, Division

### Aggregate Functions (5 examples)
SUM, AVERAGE, MIN, MAX, COUNT

### Math Functions (7 examples)
POWER, SQRT, ABS, ROUND, INT, MOD, PI

### Text Functions (10 examples)
UPPER, LOWER, LEN, &, LEFT, RIGHT, MID, PROPER, SUBSTITUTE, FIND

### Logical Operations (6 examples)
>, =, IF, AND, OR, NOT

### Statistical (3 examples)
COUNTA, SUMIF, COUNTIF

### Financial (1 example)
PMT

### Date/Time (7 examples)
TODAY, NOW, DATE, YEAR, MONTH, DAY, HOUR

### Lookup (1 example)
CHOOSE

### Complex (6 examples)
Nested functions, chained operations, real-world scenarios

## ⚠️ Critical Syntax Rules

### Range Notation
✅ **Use**: `SUM(A1\cA5)` (with `\c`)
❌ **Not**: `SUM(A1:A5)` (colon conflicts with format)

### Formula Format
```
cell:<ref>:vtf:<type>:<value>:<formula>
```

### Value Types
- `n` = numeric
- `t` = text
- `nd` = numeric date
- `nt` = numeric time
- `nl` = numeric logical
- `ne` = numeric error

## 🔧 Validation Commands

```bash
# Validate positive examples (expect 100% success)
node validate_all.js

# Validate negative examples (expect all errors)
node validate_negative.js

# Convert to JSON/JSONL training format
node convert_to_json.js
```

## 📈 Validation Results
```
Positive: 50/50 ✅ (100%)
Negative: 10/10 ❌ (all produce errors)
Success Rate: 100%
```

## 📦 Output Files
- `json/1.json` through `json/50.json` - Individual JSON files
- `formula_training.jsonl` - 50 training examples
- Training format: `{instruction, plan, output}`

## 🚫 Common Errors (from neg-*.msc)
1. Missing closing parenthesis
2. Extra closing parenthesis
3. Unbalanced nested parentheses
4. Using `:` instead of `\c` in ranges

## 💡 Quick Reference

### Simple Formula
```
cell:A3:vtf:n:30:A1+A2
```

### Range Function
```
cell:A4:vtf:n:60:SUM(A1\cA3)
```

### Nested Function
```
cell:A3:vtf:n:15:ROUND(AVERAGE(A1\cA2),0)
```

### Conditional
```
cell:A2:vtf:t:Pass:IF(A1>60,"Pass","Fail")
```

### Text Operation
```
cell:A3:vtf:t:Hello World:A1&" "&A2
```

## 📚 Full Documentation
See README.md for comprehensive details on all functions, syntax rules, and examples.
