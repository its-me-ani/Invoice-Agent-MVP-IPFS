# Formula Error Quick Reference

## 🚨 Most Common Error: Unbalanced Parentheses

### Error Message
```
Line X: Cell YZ: unbalanced parentheses in formula
```

### What It Means
The number of opening `(` and closing `)` parentheses don't match in your formula.

---

## Quick Diagnostic Checklist

When you see "unbalanced parentheses":

1. **Count parentheses** - Count all `(` and `)` - they must be equal
2. **Check function calls** - Every function like `SUM(` needs a closing `)`
3. **Look for extras** - Sometimes you have `))` when you only need `)`
4. **Check nesting** - Nested functions need proper closure

---

## Common Error Patterns

### ❌ Pattern 1: Missing Closing Parenthesis
```
❌ SUM(A1\cA5
❌ (A1+A2
❌ ROUND(AVERAGE(A1\cA5),2
❌ IF(A1>60,"Pass","Fail"
```

**Fix**: Add `)` at the end
```
✅ SUM(A1\cA5)
✅ (A1+A2)
✅ ROUND(AVERAGE(A1\cA5),2)
✅ IF(A1>60,"Pass","Fail")
```

### ❌ Pattern 2: Extra Closing Parenthesis
```
❌ (A1+A2))
❌ SUM(A1\cA5))
❌ LEN(A1))
```

**Fix**: Remove extra `)`
```
✅ (A1+A2)
✅ SUM(A1\cA5)
✅ LEN(A1)
```

### ❌ Pattern 3: Missing Opening Parenthesis
```
❌ A1+A2)
❌ A1*5)
```

**Fix**: Either remove `)` or add `(` at start
```
✅ A1+A2
✅ (A1+A2)
✅ (A1*5)
```

### ❌ Pattern 4: Nested Function Errors
```
❌ ROUND(AVERAGE(A1\cA5),2
❌ IF(AND(A1>50,A2>50),"Pass","Fail"
```

**Fix**: Close all nested levels
```
✅ ROUND(AVERAGE(A1\cA5),2)
✅ IF(AND(A1>50,A2>50),"Pass","Fail")
```

---

## Step-by-Step Debugging

### Method 1: Parenthesis Counting
1. Write out your formula
2. Go through character by character
3. +1 for each `(`, -1 for each `)`
4. The count should end at 0

Example:
```
Formula: ROUND(AVERAGE(A1\cA5),2)
         R O U N D ( A V E R A G E ( A 1 \ c A 5 ) , 2 )
Count:           +1              +2            +1   0
```

### Method 2: Matching Pairs
1. Find each `(`
2. Mark its matching `)`
3. All should have a match

```
ROUND(AVERAGE(A1\cA5),2)
     1       2     2  1
```

### Method 3: Inside-Out Validation
1. Find the innermost function
2. Verify it's properly closed
3. Move to the next level out
4. Repeat until complete

```
Level 1: AVERAGE(A1\cA5) ✓
Level 2: ROUND(..., 2) ✓
```

---

## Quick Fixes by Example

### Simple Arithmetic
```
❌ (A1+A2          ➜  ✅ (A1+A2)
❌ A1+A2)          ➜  ✅ A1+A2  OR  (A1+A2)
❌ (A1+A2))        ➜  ✅ (A1+A2)
```

### Single Function
```
❌ SUM(A1\cA5      ➜  ✅ SUM(A1\cA5)
❌ AVERAGE(A1\cA5  ➜  ✅ AVERAGE(A1\cA5)
❌ LEN(A1))        ➜  ✅ LEN(A1)
```

### Nested Functions
```
❌ ROUND(AVERAGE(A1\cA5),2     ➜  ✅ ROUND(AVERAGE(A1\cA5),2)
❌ IF(AND(A1>50,A2>50,"Pass"   ➜  ✅ IF(AND(A1>50,A2>50),"Pass","Fail")
❌ UPPER(LEFT(A1,5))           ➜  ✅ UPPER(LEFT(A1,5))
```

---

## Prevention Tips

### 1. Type Both Parentheses Immediately
When you type `(`, immediately type `)` then move cursor back:
```
Type: SUM(
Immediately: SUM()
Move cursor: SUM(|)
Continue: SUM(A1\cA5)
```

### 2. Build Functions Inside-Out
```
Step 1: AVERAGE(A1\cA5)      ← Build inner first
Step 2: ROUND(,2)            ← Build outer shell
Step 3: ROUND(AVERAGE(A1\cA5),2)  ← Combine
```

### 3. Use Validation Script
Run validation frequently:
```bash
node validate_all.js
```

### 4. Format Complex Formulas
Use indentation mentally or on paper:
```
IF(
  AND(
    A1>50,
    A2>50
  ),
  "Pass",
  "Fail"
)
```

---

## Formula Checklist

Before finalizing a formula, verify:

- [ ] Equal number of `(` and `)`
- [ ] Every function call has closing `)`
- [ ] No extra `)` at the end
- [ ] No standalone `)` without matching `(`
- [ ] Nested functions properly closed
- [ ] Range syntax uses `\c` not `:`
- [ ] Text strings in quotes `"`
- [ ] Cell references valid (e.g., A1, B2)

---

## Testing Your Formula

### Test with Validator
```bash
# Test single file
node validate_all.js

# Check if your formula produces errors
node validate_negative.js
```

### Expected Output (Valid)
```
✅ VALID - X cells, Y formulas
```

### Expected Output (Invalid)
```
❌ INVALID - 1 errors
Line X: Cell YZ: unbalanced parentheses in formula
```

---

## Other Formula Rules (Not Validated)

The validator only checks parenthesis balance. It does NOT check:

- ❌ Cell existence (A1, B1, etc.)
- ❌ Function names (INVALID is accepted)
- ❌ Parameter counts
- ❌ Type compatibility
- ❌ Division by zero
- ❌ Range validity

These are **runtime errors**, not syntax errors.

---

## When Validation Passes but Formula Still Wrong

If validation succeeds but the formula doesn't work:

1. **Check cell references** - Do the cells exist?
2. **Check function names** - Is it a valid function?
3. **Check parameter counts** - Does function need more/fewer params?
4. **Check range syntax** - Did you use `\c` instead of `:`?
5. **Check value types** - Are you using text where numbers expected?

---

## Quick Command Reference

```bash
# Validate positive examples (should be 100% valid)
node validate_all.js

# Validate negative examples (should all error)
node validate_negative.js

# Convert to training format
node convert_to_json.js
```

---

## Examples from Negative Dataset

| File | Error Type | Formula | Issue |
|------|------------|---------|-------|
| neg-1 | Missing `)` | `(A1+A2` | No closing paren |
| neg-2 | Missing `)` | `SUM(A1\cA2` | Function not closed |
| neg-3 | Extra `)` | `(A1+A2))` | Double closing |
| neg-4 | Extra `)` | `(A1+A1))` | Unbalanced |
| neg-5 | Missing `)` | `SQRT(A1` | Function unclosed |
| neg-6 | Missing `)` | `SUM(A1,A2` | Missing close |
| neg-7 | Extra `)` | `A1+10)` | No opening paren |
| neg-8 | Extra `)` | `LEN(A1))` | Extra at end |
| neg-9 | Missing `)` | `SUM(A1:A2` | Unclosed (also wrong range syntax) |
| neg-10 | Missing `)` | `((A1+5)` | Nested imbalance |

---

## Getting Help

1. **Read error message** - Tells you which cell and line
2. **Check this guide** - Find your error pattern
3. **Use checklist** - Go through validation steps
4. **Run validator** - See if fix works
5. **Check examples** - Look at working formulas in 1.msc - 50.msc

---

## Related Documentation

- **README.md** - Complete formula syntax and function reference
- **SUMMARY.md** - Quick overview and statistics
- **NEGATIVE-EXAMPLES.md** - Detailed catalog of all error examples
- **TRAINING_DATA.md** - Training data format and structure
