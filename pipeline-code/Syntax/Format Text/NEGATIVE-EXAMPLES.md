# Negative Examples - Format Text

## Purpose

These examples demonstrate **common errors** when working with text formatting in SocialCalc. Models should learn to avoid these mistakes.

## Error Categories

### 1. Missing Attribute Values

**neg-1.msc**: Missing value for tvf attribute
```
cell:A1:t:Bold Text:tvf
```
**Error**: `tvf` attribute has no value
**Fix**: `cell:A1:t:Bold Text:tvf:1`

### 2. Undefined Valueformat References

**neg-2.msc**: Reference to undefined valueformat
```
cell:A1:t:<svg>Content</svg>:tvf:5
valueformat:1:text-html
```
**Error**: valueformat 5 referenced but not defined
**Fix**: Add `valueformat:5:text-html` or use `tvf:1`

**neg-6.msc**: Invalid valueformat number
```
cell:A1:t:Text:tvf:99
valueformat:1:text-html
```
**Error**: valueformat 99 not defined
**Fix**: Use `tvf:1` or define `valueformat:99:...`

**neg-9.msc**: Very high undefined valueformat
```
cell:A1:t:<img src="https\c//example.com/logo.png" />:tvf:999
valueformat:1:text-html
```
**Error**: valueformat 999 not defined
**Fix**: Use `tvf:1` with defined format

### 3. Missing Attribute After Colon

**neg-4.msc**: Unescaped colon causing parsing error
```
cell:A1:t:<img src="https://example.com/logo.png" width="100" height="50" />:tvf:1
```
**Error**: Unescaped `:` interpreted as attribute separator
**Fix**: Escape colons: `https\c//example.com`

**neg-8.msc**: JavaScript protocol without escaping
```
cell:A1:t:<a href="javascript:void(0)">Click</a>:tvf:1
```
**Error**: Unescaped colon after `javascript`
**Fix**: `href="javascript\cvoid(0)"`

### 4. Missing Cell Value

**neg-5.msc**: Cell has format but no content
```
cell:A1:tvf:1
```
**Error**: No text value specified
**Fix**: `cell:A1:t:Content:tvf:1`

### 5. Invalid Attribute Order

**neg-10.msc**: Format attribute before text
```
cell:A1:tvf:1:t:Text
```
**Error**: Attributes in wrong order
**Fix**: `cell:A1:t:Text:tvf:1` (value before format)

### 6. Examples Without Detected Errors

Some negative examples don't trigger validation errors because the validator is permissive:

**neg-3.msc**: Duplicate tvf attributes
```
cell:A1:t:Text:tvf:1:tvf:1
```
**Issue**: Duplicate attributes (may cause undefined behavior)
**Best Practice**: Use each attribute only once

**neg-7.msc**: Missing sheet definition
```
version:1.5
cell:A1:t:Text:tvf:1
valueformat:1:text-html
```
**Issue**: No sheet line (but optional)
**Best Practice**: Always include `sheet:c:1:r:1`

## Common Mistakes to Avoid

### ❌ Unescaped Colons
```
Bad:  <a href="https://example.com">Link</a>
Good: <a href="https\c//example.com">Link</a>

Bad:  <div style="color:red;">Text</div>
Good: <div style="color\cred;">Text</div>
```

### ❌ Undefined Valueformats
```
Bad:  cell:A1:t:Text:tvf:5
      valueformat:1:text-html

Good: cell:A1:t:Text:tvf:1
      valueformat:1:text-html
```

### ❌ Missing Values
```
Bad:  cell:A1:t:Text:tvf
Good: cell:A1:t:Text:tvf:1

Bad:  cell:A1:tvf:1
Good: cell:A1:t:Content:tvf:1
```

### ❌ Wrong Attribute Order
```
Bad:  cell:A1:tvf:1:t:Text
Good: cell:A1:t:Text:tvf:1
```

## Validation Statistics

- **Total Negative Examples**: 10
- **Detected Errors**: 6 (60%)
- **Permissive Cases**: 4 (40%)

## Error Messages

Common validation errors you'll see:

1. **"Attribute 'tvf' missing value"**
   - Missing number after tvf:
   - Fix: Add valueformat reference

2. **"Cell A1: valueformat X not defined"**
   - Referenced valueformat doesn't exist
   - Fix: Define the valueformat or use existing number

3. **"Attribute '1' missing value"**
   - Unescaped colon causing parsing issue
   - Fix: Escape colons with `\c`

## Learning Objectives

Models should learn to:

1. ✅ Always define valueformats before referencing them
2. ✅ Escape colons in URLs and CSS styles
3. ✅ Provide values for all attributes
4. ✅ Use correct attribute order (value → format → other)
5. ✅ Include required definitions (sheet, valueformat)
6. ✅ Avoid duplicate attributes
7. ✅ Validate valueformat references

## Testing Negative Examples

Run validation:
```bash
node validate_negative.js
```

Expected output:
- Examples with ✅ have errors (as intended)
- Examples with ⚠️ don't have errors (validator is permissive)

## Best Practices

1. **Always escape colons**: `\c` in content
2. **Define all valueformats**: Before referencing
3. **Use sequential numbers**: 1, 2, 3... for valueformats
4. **Provide all required values**: Don't leave attributes empty
5. **Follow attribute order**: coord:value:format:style
6. **Close all tags**: Proper HTML/SVG syntax
7. **Include sheet definition**: Even if optional

---

**Remember**: These negative examples teach what NOT to do! 🚫
