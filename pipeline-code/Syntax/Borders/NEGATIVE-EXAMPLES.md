# Negative Border Examples - Error Documentation

## Overview
This directory contains 10 negative examples demonstrating common border syntax errors in SocialCalc format. These examples are based on real validation failures encountered during dataset creation.

## Error Catalog

### neg-1.msc - Empty Border Values
**Error Type:** Empty position values in border tuple  
**Invalid Syntax:** `b::1::1` (empty values)  
**Correct Syntax:** `b:0:1:0:1` (use 0 for no border)  
**Validator Message:** "Cell A1: top border not defined"  
**Common Cause:** Text editor or script replacing values incorrectly, leaving :: instead of :0:

### neg-2.msc - Invalid Color Format (Named Color)
**Error Type:** Using named color instead of rgb()  
**Invalid Syntax:** `border:2:2px dashed blue`  
**Correct Syntax:** `border:2:2px dashed rgb(0,0,255)`  
**Validator Message:** "Border color must be rgb() or #hex format, got 'blue'"  
**Common Cause:** Copying CSS-style colors directly without conversion

### neg-3.msc - Trailing Colon
**Error Type:** Extra colon after border definition  
**Invalid Syntax:** `b:1:1:1:1:`  
**Correct Syntax:** `b:1:1:1:1`  
**Validator Message:** "Attribute '' missing value"  
**Common Cause:** String concatenation errors or regex replacements adding extra delimiters

### neg-4.msc - Undefined Border Reference
**Error Type:** Referencing a border ID that doesn't exist  
**Invalid Syntax:** `b:5:1:1:1` (border:5 not defined)  
**Correct Syntax:** Define `border:5:...` before using, or use existing border ID  
**Validator Message:** "Cell A1: top border 5 not defined"  
**Common Cause:** Copy-paste from another file, forgetting to copy border definitions

### neg-5.msc - Incomplete Border Tuple
**Error Type:** Missing values in border position tuple  
**Invalid Syntax:** `b:1:1` (only 2 values)  
**Correct Syntax:** `b:1:1:0:0` (requires 4 values: top:right:bottom:left)  
**Validator Message:** "Cell A1: 'b' requires 4 values (top:right:bottom:left)"  
**Common Cause:** Forgetting CSS order is different (CSS: top right bottom left vs just top/bottom)

### neg-6.msc - Double Colon Before Attribute
**Error Type:** Empty value between border and next attribute  
**Invalid Syntax:** `b:1:1:1:1::bg:2`  
**Correct Syntax:** `b:1:1:1:1:bg:2`  
**Validator Message:** "Attribute '2' missing value"  
**Common Cause:** Incorrect string replacement, duplicate separator insertion

### neg-7.msc - Empty Border Definition
**Error Type:** Border definition with no value  
**Invalid Syntax:** `border:2:` (empty definition)  
**Correct Syntax:** `border:2:1px solid rgb(0,0,0)`  
**Validator Message:** "Border definition requires 3 parts (thickness style color), got 1"  
**Common Cause:** Incomplete copy-paste, placeholder not filled in

### neg-8.msc - Invalid Border Thickness
**Error Type:** Using CSS keyword instead of pixel value  
**Invalid Syntax:** `border:1:thick solid rgb(0,0,0)`  
**Correct Syntax:** `border:1:3px solid rgb(0,0,0)`  
**Validator Message:** "Border thickness must be in pixels (e.g., 1px), got 'thick'"  
**Common Cause:** Direct CSS conversion without translating keywords to pixel values

### neg-9.msc - Too Many Border Values
**Error Type:** Extra value in border position tuple  
**Invalid Syntax:** `b:1:1:1:1:1` (5 values)  
**Correct Syntax:** `b:1:1:1:1` (exactly 4 values)  
**Validator Message:** "Attribute '1' missing value"  
**Common Cause:** Duplication error, adding shorthand value incorrectly

### neg-10.msc - Incomplete Border Tuple (3 values)
**Error Type:** One value missing from border tuple  
**Invalid Syntax:** `b:1:1:1` (only 3 values)  
**Correct Syntax:** `b:1:1:1:0` (4 values required)  
**Validator Message:** "Cell A1: 'b' requires 4 values (top:right:bottom:left)"  
**Common Cause:** Partial edit, forgetting fourth position

## Error Categories

### Structural Errors (30%)
- neg-3: Trailing colon
- neg-6: Double colon before attribute
- neg-7: Empty border definition

### Value Count Errors (30%)
- neg-5: Incomplete border tuple (2 values)
- neg-9: Too many border values (5 values)
- neg-10: Incomplete border tuple (3 values)

### Reference Errors (10%)
- neg-4: Undefined border reference

### Format Errors (30%)
- neg-1: Empty border values
- neg-2: Invalid color format (named)
- neg-8: Invalid border thickness

## Usage in Training

These negative examples teach the model:
1. **What NOT to do** - Common syntax mistakes
2. **Error patterns** - How invalid syntax manifests
3. **Validation rules** - Requirements for border definitions
4. **Debugging** - How to identify and fix errors

## Validation Statistics

Total Files: 10
Total Errors: 11 (some files have multiple errors)
Success Rate: 0% (all intentionally invalid)
Most Common Error: Empty/missing values (3 examples)
