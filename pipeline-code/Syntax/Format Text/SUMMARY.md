# Format Text Examples - Summary

## Quick Overview

**30 examples** demonstrating text formatting in SocialCalc with HTML, SVG, images, and various text styles.

## Categories

### 1. Basic Text (Examples 1-5)
- Default format
- Plain text
- Bold, Italic, Underlined HTML

### 2. Images (Examples 6, 14)
- External images with dimensions
- Base64 inline images

### 3. SVG Graphics (Examples 7-9, 15, 24-30)
- Simple shapes (circle, triangle, polygon)
- Logos with text
- Financial icons
- Gradients
- Verification badges
- Complex company logos

### 4. Styled Text (Examples 10-13)
- Custom colors with CSS
- Highlighted backgrounds
- Large bold fonts

### 5. Links (Example 12)
- Hyperlinks with text-link format

### 6. Special Formatting (Examples 17-23)
- Superscript/Subscript
- Code snippets
- Preformatted text
- Lists (ordered/unordered)
- HTML tables

### 7. Mixed Formats (Examples 16, 24, 26, 28)
- Headers with logos
- Signature sections
- Invoice headers

## Key Syntax Patterns

### Text Format Reference
```
cell:A1:t:Content:tvf:1
valueformat:1:text-html
```

### HTML Content
```
cell:A1:t:<b>Bold</b>:tvf:1
valueformat:1:text-html
```

### SVG Graphics
```
cell:A1:t:<svg width="50" height="50"><circle cx="25" cy="25" r="20" fill="blue" /></svg>:tvf:1
valueformat:1:text-html
```

### Image Embedding
```
cell:A1:t:<img src="https\c//example.com/logo.png" width="100" height="50" />:tvf:1
valueformat:1:text-html
```

### Links
```
cell:A1:t:<a href="https\c//example.com">Visit</a>:tvf:1
valueformat:1:text-link
```

## Important Rules

1. **Escape Colons**: Use `\c` for colons in URLs and CSS
2. **Define Valueformats**: Always define referenced valueformat numbers
3. **Specify Dimensions**: Include width/height for images and SVG
4. **Close Tags**: Properly close all HTML/SVG tags
5. **Use Correct Format**: `text-html` for HTML/SVG, `text-link` for links

## Valueformat Types

| Type | Use Case |
|------|----------|
| `text-plain` | Plain text |
| `text-html` | HTML content, SVG |
| `text-link` | Hyperlinks |
| `text-wiki` | Wiki markup |

## Validation Results

✅ **30/30 positive examples valid (100%)**
✅ **6/10 negative examples demonstrate errors correctly**

## Use Cases

- Invoice headers with financial icons
- Company logos and branding
- Signature sections with images
- Verification badges
- Rich formatted text
- Embedded graphics and images
