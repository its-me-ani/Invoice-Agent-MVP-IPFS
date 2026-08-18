# SocialCalc Formula Training Dataset

## Overview
This directory contains 50 training examples and 10 negative examples for SocialCalc spreadsheet formulas. The dataset covers comprehensive formula functionality including arithmetic operations, mathematical functions, text manipulation, logical operations, date/time functions, statistical functions, and more.

## Dataset Structure

### Positive Examples (1.msc - 50.msc)
50 valid SocialCalc files demonstrating proper formula syntax across multiple categories:

#### Arithmetic Operations (1-4)
- **1.msc**: Basic addition (A1+A2)
- **2.msc**: Subtraction (A1-A2)
- **3.msc**: Multiplication (A1*A2)
- **4.msc**: Division (A1/A2)

#### Aggregate Functions (5-9)
- **5.msc**: SUM function with range
- **6.msc**: AVERAGE function
- **7.msc**: MIN function
- **8.msc**: MAX function
- **9.msc**: COUNT function

#### Mathematical Functions (10-16)
- **10.msc**: POWER function (exponentiation)
- **11.msc**: SQRT (square root)
- **12.msc**: ABS (absolute value)
- **13.msc**: ROUND (rounding with precision)
- **14.msc**: INT (integer part)
- **15.msc**: MOD (modulus/remainder)
- **16.msc**: PI constant in calculations

#### Text Functions (17-23)
- **17.msc**: UPPER (convert to uppercase)
- **18.msc**: LOWER (convert to lowercase)
- **19.msc**: LEN (string length)
- **20.msc**: Concatenation with & operator
- **21.msc**: LEFT (extract left substring)
- **22.msc**: RIGHT (extract right substring)
- **23.msc**: MID (extract middle substring)

#### Logical Operations (24-29)
- **24.msc**: Comparison operator (>)
- **25.msc**: Equality operator (=)
- **26.msc**: IF conditional function
- **27.msc**: AND logical function
- **28.msc**: OR logical function
- **29.msc**: NOT logical function

#### Constants (30)
- **30.msc**: PI() constant

#### Statistical Functions (31-33)
- **31.msc**: COUNTA (count non-empty cells)
- **32.msc**: SUMIF (conditional sum)
- **33.msc**: COUNTIF (conditional count)

#### Financial Functions (34)
- **34.msc**: PMT (payment calculation)

#### Date/Time Functions (35-40)
- **35.msc**: TODAY (current date)
- **36.msc**: NOW (current date/time)
- **37.msc**: DATE (create date from components)
- **38.msc**: YEAR (extract year)
- **39.msc**: MONTH (extract month)
- **40.msc**: DAY (extract day)

#### Lookup Functions (41)
- **41.msc**: CHOOSE (select by index)

#### Complex Formulas (42-44)
- **42.msc**: Chained operations with parentheses
- **43.msc**: Nested functions (ROUND + AVERAGE)
- **44.msc**: Product table with multiple formulas

#### Advanced Text Functions (45-47)
- **45.msc**: PROPER (proper case conversion)
- **46.msc**: SUBSTITUTE (text replacement)
- **47.msc**: FIND (search text position)

#### Time Functions (48)
- **48.msc**: HOUR (extract hour from time)

#### Boolean Constants (49)
- **49.msc**: TRUE and FALSE functions

#### Real-world Example (50)
- **50.msc**: Complete pricing table with multiple formulas

### Negative Examples (neg-1.msc - neg-10.msc)
10 invalid examples demonstrating common syntax errors:

- **neg-1.msc**: Missing closing parenthesis
- **neg-2.msc**: Unbalanced parentheses in SUM
- **neg-3.msc**: Extra closing parenthesis
- **neg-4.msc**: Unbalanced parentheses
- **neg-5.msc**: Missing closing parenthesis in SQRT
- **neg-6.msc**: Unclosed SUM function
- **neg-7.msc**: Missing opening parenthesis
- **neg-8.msc**: Extra closing parenthesis in LEN
- **neg-9.msc**: Unbalanced parentheses with colon
- **neg-10.msc**: Nested unbalanced parentheses

## Formula Syntax

### Basic Structure
Formulas in SocialCalc are stored in cells using the `vtf` (value-text-formula) format:
```
cell:<cellref>:vtf:<type>:<value>:<formula>
```

### Value Types
- `n`: Numeric result
- `t`: Text result
- `nd`: Numeric date
- `nt`: Numeric time
- `nl`: Numeric logical
- `ne`: Numeric error

### Range Notation
**CRITICAL**: Ranges in formulas use `\c` (escaped colon) instead of `:` to avoid conflicts with the cell format's colon delimiters.

**Correct**:
```
cell:A5:vtf:n:150:SUM(A1\cA4)
```

**Incorrect** (will cause parsing errors):
```
cell:A5:vtf:n:150:SUM(A1:A4)
```

### Supported Functions

#### Arithmetic Operators
- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division

#### Mathematical Functions
- `SUM(range)` - Sum of range
- `AVERAGE(range)` - Average of range
- `MIN(range)` - Minimum value
- `MAX(range)` - Maximum value
- `COUNT(range)` - Count numeric values
- `POWER(base, exponent)` - Exponentiation
- `SQRT(number)` - Square root
- `ABS(number)` - Absolute value
- `ROUND(number, decimals)` - Round to decimals
- `INT(number)` - Integer part
- `MOD(number, divisor)` - Modulus/remainder
- `PI()` - Pi constant

#### Text Functions
- `UPPER(text)` - Convert to uppercase
- `LOWER(text)` - Convert to lowercase
- `LEN(text)` - Length of text
- `LEFT(text, num)` - Left substring
- `RIGHT(text, num)` - Right substring
- `MID(text, start, length)` - Middle substring
- `PROPER(text)` - Proper case
- `SUBSTITUTE(text, old, new)` - Replace text
- `FIND(search, text)` - Find position
- `&` - Concatenation operator

#### Logical Functions
- `IF(condition, true_value, false_value)` - Conditional
- `AND(condition1, condition2, ...)` - Logical AND
- `OR(condition1, condition2, ...)` - Logical OR
- `NOT(condition)` - Logical NOT
- `TRUE()` - Boolean true (returns 1)
- `FALSE()` - Boolean false (returns 0)
- `>` - Greater than
- `<` - Less than
- `=` - Equal to

#### Date/Time Functions
- `TODAY()` - Current date
- `NOW()` - Current date and time
- `DATE(year, month, day)` - Create date
- `YEAR(date)` - Extract year
- `MONTH(date)` - Extract month
- `DAY(date)` - Extract day
- `HOUR(time)` - Extract hour

#### Statistical Functions
- `COUNTA(range)` - Count non-empty cells
- `SUMIF(range, criteria)` - Conditional sum
- `COUNTIF(range, criteria)` - Conditional count

#### Financial Functions
- `PMT(rate, nper, pv)` - Payment calculation

#### Lookup Functions
- `CHOOSE(index, value1, value2, ...)` - Choose by index

## Validation

### Running Validation
Three validation scripts are provided:

1. **validate_all.js** - Validates all 50 positive examples:
```bash
node validate_all.js
```
Expected: 100% success rate (50/50 valid)

2. **validate_negative.js** - Validates negative examples produce errors:
```bash
node validate_negative.js
```
Expected: All 10 files should produce "unbalanced parentheses" errors

3. **convert_to_json.js** - Converts examples to JSON and JSONL training format:
```bash
node convert_to_json.js
```
Creates:
- `json/` directory with 50 individual JSON files
- `formula_training.jsonl` with training data

### Validation Results
- **Positive Examples**: 50/50 valid (100%)
- **Negative Examples**: 10/10 produce expected errors
- **Total Formulas**: 59 formula expressions across all examples

## Training Data Format

The `formula_training.jsonl` file contains training examples in the format:
```json
{"instruction": "Create a simple addition formula", "plan": "Add two numbers in cells A1 and A2", "output": "cell:A3:vtf:n:30:A1+A2"}
```

Each line is a complete JSON object with:
- **instruction**: What the user wants to do
- **plan**: How to accomplish it
- **output**: The actual SocialCalc formula syntax

## Common Pitfalls

### 1. Range Syntax
❌ **Wrong**: `SUM(A1:A5)`
✅ **Correct**: `SUM(A1\cA5)`

### 2. Parentheses Balance
All opening `(` must have matching closing `)`:
```
✅ ROUND(AVERAGE(A1\cA5),2)
❌ ROUND(AVERAGE(A1\cA5,2)
```

### 3. Text in Formulas
Text strings must be in double quotes:
```
✅ IF(A1>60,"Pass","Fail")
❌ IF(A1>60,Pass,Fail)
```

### 4. Function Parameters
Functions require proper parameter count:
```
✅ POWER(A1,2)
❌ POWER(A1)
```

### 5. Cell References
Cell references are case-sensitive and must follow A1 notation:
```
✅ A1, B2, C10
❌ a1, 1A, AA
```

## Usage Examples

### Simple Calculation
```
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:A1+A2
```

### Range Function
```
cell:A1:v:10
cell:A2:v:20
cell:A3:v:30
cell:A4:vtf:n:60:SUM(A1\cA3)
```

### Nested Functions
```
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:15:ROUND(AVERAGE(A1\cA2),0)
```

### Conditional Logic
```
cell:A1:v:75
cell:A2:vtf:t:Pass:IF(A1>60,"Pass","Fail")
```

### Text Manipulation
```
cell:A1:t:hello
cell:A2:t:world
cell:A3:vtf:t:Hello World:UPPER(A1)&" "&UPPER(A2)
```

## Dependencies
- Node.js (for validation scripts)
- `../../validator.js` - SocialCalcValidator module

## File Structure
```
Formales/
├── 1.msc - 50.msc          # 50 positive examples
├── neg-1.msc - neg-10.msc  # 10 negative examples
├── validate_all.js         # Validation script for positive examples
├── validate_negative.js    # Validation script for negative examples
├── convert_to_json.js      # JSON/JSONL conversion script
├── formula_training.jsonl  # Training data (50 examples)
├── json/                   # Individual JSON files (50 files)
│   ├── 1.json
│   ├── 2.json
│   └── ...
└── README.md              # This file
```

## Notes
- All examples use SocialCalc version 1.5 format
- Formula validation only checks syntax, not semantic correctness
- The validator specifically checks for unbalanced parentheses
- Error types (ne) like #DIV/0! are valid syntax but represent runtime errors
- Range references must always use `\c` escape sequence

## Contributing
When adding new examples:
1. Follow the established numbering scheme
2. Use proper formula syntax with `\c` for ranges
3. Include balanced parentheses
4. Test with `validate_all.js` before committing
5. Add training data mapping in `convert_to_json.js`
6. Update this README with new categories/functions
