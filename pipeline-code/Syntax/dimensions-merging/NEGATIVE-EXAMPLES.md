# Negative Examples - Dimensions & Merging

## Overview
This directory contains 10 negative examples demonstrating common errors when working with colspan and rowspan in SocialCalc format. These examples are designed to test error handling and validation.

## Error Catalog

### neg-1.msc - Invalid Attribute Name
**Error Type:** Attribute without corresponding value  
**Invalid Syntax:** `cell:A1:t:Text:colspan:2:invalidattr`  
**Correct Syntax:** Remove invalid attribute or provide value  
**Validator Message:** "Attribute 'invalidattr' missing value"  
**Common Cause:** Typo in attribute name or incomplete attribute-value pair

---

### neg-2.msc - Missing Colspan Value
**Error Type:** Attribute declared without value  
**Invalid Syntax:** `cell:A1:t:Text:colspan`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Attribute 'colspan' missing value"  
**Common Cause:** String truncation, incomplete edit, or missing parameter

---

### neg-3.msc - Double Colon (Empty Attribute)
**Error Type:** Empty value between colons creates invalid attribute  
**Invalid Syntax:** `cell:A1:t:Text::colspan:2`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Attribute '2' missing value"  
**Common Cause:** Accidental double-typing of colon, regex replacement error

---

### neg-4.msc - Empty Colspan Value
**Error Type:** Missing value between attribute name and next colon  
**Invalid Syntax:** `cell:A1:t:Text:colspan::2`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Cell A1: 'colspan' must be positive integer, got ''"  
**Common Cause:** Deletion of value without removing colon, string manipulation error

---

### neg-5.msc - Non-Numeric Colspan
**Error Type:** Text value instead of integer  
**Invalid Syntax:** `cell:A1:t:Text:colspan:two`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Cell A1: 'colspan' must be positive integer, got 'two'"  
**Common Cause:** Using word instead of number, user input not validated

---

### neg-6.msc - Zero Colspan
**Error Type:** Zero value (must be positive integer ≥ 1)  
**Invalid Syntax:** `cell:A1:t:Text:colspan:0`  
**Correct Syntax:** `cell:A1:t:Text:colspan:1` or `colspan:2`  
**Validator Message:** "Cell A1: 'colspan' must be positive integer, got '0'"  
**Common Cause:** Default/placeholder value not updated, mathematical error

---

### neg-7.msc - Negative Rowspan
**Error Type:** Negative value (must be positive)  
**Invalid Syntax:** `cell:A1:t:Text:rowspan:-1`  
**Correct Syntax:** `cell:A1:t:Text:rowspan:1` or `rowspan:2`  
**Validator Message:** "Cell A1: 'rowspan' must be positive integer, got '-1'"  
**Common Cause:** Arithmetic error, incorrect decrement operation

---

### neg-8.msc - Trailing Colon
**Error Type:** Extra colon at end of cell definition  
**Invalid Syntax:** `cell:A1:t:Text:colspan:2:`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Attribute '' missing value"  
**Common Cause:** String concatenation adding delimiter, incomplete attribute addition

---

### neg-9.msc - Alphabetic Characters in Colspan
**Error Type:** Letters used instead of digits  
**Invalid Syntax:** `cell:A1:t:Text:colspan:abc`  
**Correct Syntax:** `cell:A1:t:Text:colspan:2`  
**Validator Message:** "Cell A1: 'colspan' must be positive integer, got 'abc'"  
**Common Cause:** Variable name used instead of value, testing/debug code

---

### neg-10.msc - Invalid Sheet Dimension
**Error Type:** Non-numeric value in sheet columns specification  
**Invalid Syntax:** `sheet:c:abc:r:1`  
**Correct Syntax:** `sheet:c:3:r:1`  
**Validator Message:** "Sheet 'c' (columns) must be positive integer, got 'abc'"  
**Common Cause:** Incorrect parameter, string interpolation error

---

## Error Categories

### 1. Missing Values (neg-2, neg-4)
Attributes declared without corresponding values. Always provide both attribute name and value.

### 2. Type Errors (neg-5, neg-9, neg-10)
Non-numeric values where integers are required. Colspan, rowspan, and sheet dimensions must be positive integers.

### 3. Range Errors (neg-6, neg-7)
Values outside valid range (must be ≥ 1). Zero and negative values are not allowed for dimensions.

### 4. Syntax Errors (neg-1, neg-3, neg-8)
Malformed attribute-value pairs, extra colons, or missing delimiters.

## Validation Testing

All negative examples should be **rejected** by the validator:

```bash
node validate_negative.js
```

Expected output:
```
✅ CORRECTLY INVALID - 10/10 (100%)
```

## Common Patterns to Avoid

### ❌ Wrong: Using Zero
```
cell:A1:t:Text:colspan:0
```
Minimum value is 1 (though 1 means no merging, so typically use 2+)

### ❌ Wrong: Missing Value
```
cell:A1:t:Text:colspan:
```
Always provide the numeric value after the attribute

### ❌ Wrong: String Values
```
cell:A1:t:Text:rowspan:three
```
Must be numeric: `rowspan:3`

### ❌ Wrong: Trailing Colon
```
cell:A1:t:Text:colspan:2:rowspan:3:
```
Remove the trailing colon

### ❌ Wrong: Double Colon
```
cell:A1:t:Text::colspan:2
```
Single colon between attributes

### ✅ Correct: Valid Merge
```
cell:A1:t:Text:colspan:2:rowspan:3
```

## Error Prevention Checklist

- [ ] Check colspan/rowspan values are positive integers
- [ ] Verify no trailing colons
- [ ] Ensure no double colons (::)
- [ ] Validate all attribute names are recognized
- [ ] Confirm all attributes have values
- [ ] Test sheet dimensions are numeric
- [ ] Verify no alphabetic characters in numeric fields

## Integration Testing

These negative examples should be used to test:

1. **Parser Error Handling:** Does the parser catch and report these errors?
2. **Error Messages:** Are error messages clear and helpful?
3. **Validation Logic:** Is validation consistent across all error types?
4. **Edge Cases:** Do extreme values (very large, very small) get caught?

## Related Documentation

- See `README.md` for valid merge syntax
- See `SYNTAX.md` in docs/ for full specification
- See positive examples (1.msc - 50.msc) for correct usage

---

**Purpose:** Error detection and validation testing  
**Status:** All 10 examples correctly identified as invalid  
**Last Validated:** December 2024
