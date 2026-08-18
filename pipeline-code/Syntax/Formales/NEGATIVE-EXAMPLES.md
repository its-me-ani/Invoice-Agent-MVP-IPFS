# Negative Formula Examples - Error Catalog

## Overview
This document catalogs all 10 negative examples in the formula training dataset. Each example demonstrates a specific syntax error that the SocialCalc validator detects.

## Error Summary
All negative examples produce **unbalanced parentheses** errors, which is the primary syntax error the validator catches in formulas.

---

## neg-1.msc - Missing Closing Parenthesis

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:(A1+A2
sheet:c:1:r:3
```

### Error
```
Line 4: Cell A3: unbalanced parentheses in formula
```

### Explanation
The formula `(A1+A2` opens a parenthesis but never closes it. Every `(` must have a matching `)`.

### Correct Version
```
cell:A3:vtf:n:30:(A1+A2)
```

---

## neg-2.msc - Missing Closing Parenthesis in Function

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:SUM(A1\cA2
sheet:c:1:r:3
```

### Error
```
Line 4: Cell A3: unbalanced parentheses in formula
```

### Explanation
The SUM function is opened with `(` but never closed with `)`.

### Correct Version
```
cell:A3:vtf:n:30:SUM(A1\cA2)
```

---

## neg-3.msc - Extra Closing Parenthesis

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:(A1+A2))
sheet:c:1:r:3
```

### Error
```
Line 4: Cell A3: unbalanced parentheses in formula
```

### Explanation
The formula has two closing `)` but only one opening `(`, creating an imbalance.

### Correct Version
```
cell:A3:vtf:n:30:(A1+A2)
```

---

## neg-4.msc - Unbalanced Nested Parentheses

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:vtf:n:30:(A1+A1))
sheet:c:1:r:2
```

### Error
```
Line 3: Cell A2: unbalanced parentheses in formula
```

### Explanation
One opening parenthesis but two closing parentheses.

### Correct Version
```
cell:A2:vtf:n:20:(A1+A1)
```

---

## neg-5.msc - Missing Closing in SQRT

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:vtf:n:10:SQRT(A1
sheet:c:1:r:2
```

### Error
```
Line 3: Cell A2: unbalanced parentheses in formula
```

### Explanation
SQRT function opened but not closed.

### Correct Version
```
cell:A2:vtf:n:3.162:SQRT(A1)
```

---

## neg-6.msc - Unclosed SUM Function

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:SUM(A1,A2
sheet:c:1:r:3
```

### Error
```
Line 4: Cell A3: unbalanced parentheses in formula
```

### Explanation
SUM function call is not terminated with closing parenthesis.

### Correct Version
```
cell:A3:vtf:n:30:SUM(A1,A2)
```

---

## neg-7.msc - Missing Opening Parenthesis

### File Content
```
version:1.5
cell:A1:v:5
cell:A2:vtf:n:10:A1+10)
sheet:c:1:r:2
```

### Error
```
Line 3: Cell A2: unbalanced parentheses in formula
```

### Explanation
Formula has closing `)` without a corresponding opening `(`.

### Correct Version
```
cell:A2:vtf:n:15:(A1+10)
```
or
```
cell:A2:vtf:n:15:A1+10
```

---

## neg-8.msc - Extra Closing in LEN

### File Content
```
version:1.5
cell:A1:t:hello
cell:A2:vtf:n:5:LEN(A1))
sheet:c:1:r:2
```

### Error
```
Line 3: Cell A2: unbalanced parentheses in formula
```

### Explanation
LEN function properly closed, but followed by an extra `)`.

### Correct Version
```
cell:A2:vtf:n:5:LEN(A1)
```

---

## neg-9.msc - Unbalanced with Colon

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:v:20
cell:A3:vtf:n:30:SUM(A1:A2
sheet:c:1:r:3
```

### Error
```
Line 4: Cell A3: unbalanced parentheses in formula
```

### Explanation
Missing closing parenthesis in SUM function. Note: This also has the wrong range syntax (using `:` instead of `\c`), but the validator catches the parenthesis error first.

### Correct Version
```
cell:A3:vtf:n:30:SUM(A1\cA2)
```

---

## neg-10.msc - Nested Unbalanced Parentheses

### File Content
```
version:1.5
cell:A1:v:10
cell:A2:vtf:n:100:((A1+5)
sheet:c:1:r:2
```

### Error
```
Line 3: Cell A2: unbalanced parentheses in formula
```

### Explanation
Two opening parentheses `((` but only one closing `)`.

### Correct Version
```
cell:A2:vtf:n:15:((A1+5))
```
or
```
cell:A2:vtf:n:15:(A1+5)
```

---

## Error Patterns

### Pattern 1: Missing Closing Parenthesis (7 examples)
Most common error - opening `(` without closing `)`
- neg-1, neg-2, neg-5, neg-6, neg-9, neg-10

### Pattern 2: Extra Closing Parenthesis (3 examples)
Closing `)` without matching opening `(`
- neg-3, neg-4, neg-7, neg-8

### Pattern 3: Nested Imbalance (1 example)
Multiple levels of parentheses with imbalance
- neg-10

## What the Validator Checks

The SocialCalc validator performs **syntax validation** only:
- ✅ Parentheses balance (checked)
- ❌ Undefined cell references (not checked)
- ❌ Division by zero (not checked)
- ❌ Invalid function names (not checked)
- ❌ Type mismatches (not checked)
- ❌ Wrong parameter count (not checked)

## Validation Command
```bash
node validate_negative.js
```

## Expected Results
```
Total files: 10
Total errors found: 10
All files should show: "✓ File has errors as expected"
```

## Common Mistakes in Formula Writing

1. **Forgetting to close functions**
   ```
   ❌ SUM(A1\cA5
   ✅ SUM(A1\cA5)
   ```

2. **Mismatched nested parentheses**
   ```
   ❌ ((A1+A2)
   ✅ ((A1+A2))
   ```

3. **Extra closing parentheses**
   ```
   ❌ (A1+A2))
   ✅ (A1+A2)
   ```

4. **Missing opening parenthesis**
   ```
   ❌ A1+A2)
   ✅ (A1+A2)
   ```

5. **Unclosed nested functions**
   ```
   ❌ ROUND(AVERAGE(A1\cA5),2
   ✅ ROUND(AVERAGE(A1\cA5),2)
   ```

## Tips for Avoiding Parenthesis Errors

1. **Count as you type**: For every `(` you type, immediately type the matching `)`
2. **Use an editor with matching**: Many editors highlight matching parentheses
3. **Work inside-out**: When nesting, write the innermost function first
4. **Validate early**: Run validation frequently during development
5. **Use consistent formatting**: Format complex formulas with indentation for clarity

## Related Documentation
- See README.md for complete formula syntax
- See ERROR-QUICK-REFERENCE.md for troubleshooting guide
- See SUMMARY.md for quick reference
