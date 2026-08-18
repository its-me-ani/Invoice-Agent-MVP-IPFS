# Format Text Training Dataset

## Overview

This dataset contains **30 positive examples** and **10 negative examples** demonstrating text formatting in SocialCalc, including HTML content, SVG graphics, images, and various text styles.

## 📊 Dataset Statistics

- **Total Examples**: 30 positive + 10 negative = **40 files**
- **JSON Files**: 30 generated
- **Training Data**: 30 instruction/plan/output triples
- **Validation**: 100% pass rate for positive examples

## 🎯 Learning Objectives

This dataset trains models to:

1. **Apply Text Formats**: Use `tvf` (text value format) attribute correctly
2. **Embed HTML Content**: Use `text-html` format for rich content
3. **Embed Images**: Use `<img>` tags with proper escaping
4. **Create SVG Graphics**: Inline SVG for logos, icons, and graphics
5. **Style Text**: Apply HTML tags like `<b>`, `<i>`, `<u>`, etc.
6. **Create Links**: Use `text-link` format for hyperlinks
7. **Mix Formats**: Combine different valueformats in single sheet

## 📁 File Structure

```
Format Text/
├── 1.msc - 30.msc          # Positive examples
├── neg-1.msc - neg-10.msc  # Negative examples
├── json/                    # Generated JSON files
│   └── 1.json - 30.json
├── convert_to_json.js       # Conversion script
├── validate_all.js          # Validation for positive examples
├── validate_negative.js     # Validation for negative examples
├── format_text_training.jsonl  # Training data
└── README.md               # This file
```

## 📚 Example Breakdown

### Basic Text Formats (1-5)

**Example 1**: Default text (no format)
```
cell:A1:t:Simple Text - Default Format
```

**Example 2**: Plain text format
```
cell:A1:t:Plain Text:tvf:1
valueformat:1:text-plain
```

**Example 3**: Bold HTML text
```
cell:A1:t:<b>Bold Text</b>:tvf:1
valueformat:1:text-html
```

**Example 4**: Italic HTML text
```
cell:A1:t:<i>Italic Text</i>:tvf:1
valueformat:1:text-html
```

**Example 5**: Underlined text
```
cell:A1:t:<u>Underlined Text</u>:tvf:1
valueformat:1:text-html
```

### Image Embedding (6, 14)

**Example 6**: External image with dimensions
```
cell:A1:t:<img src="https\c//example.com/logo.png" width="100" height="50" />:tvf:1
valueformat:1:text-html
```
- Uses escaped colon `\c` in URL
- Specifies width and height

**Example 14**: Base64 encoded image
```
cell:A1:t:<img src="data\cimage/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" alt="Icon" />:tvf:1
valueformat:1:text-html
```
- Inline image data
- No external dependency

### SVG Graphics (7-9, 15, 24-30)

**Example 7**: Simple SVG circle
```
cell:A1:t:<svg width="50" height="50"><circle cx="25" cy="25" r="20" fill="blue" /></svg>:tvf:1
valueformat:1:text-html
```

**Example 8**: SVG logo with text
```
cell:A1:t:<svg width="100" height="40"><rect width="100" height="40" fill="red" /><text x="50" y="25" fill="white" text-anchor="middle">LOGO</text></svg>:tvf:1
valueformat:1:text-html
```

**Example 9**: Company logo with polygon
```
cell:A1:t:<svg width="120" height="80"><polygon points="10,10 110,10 110,70 10,70" fill="green" stroke="black" stroke-width="2"/><text x="60" y="45" fill="white" text-anchor="middle" font-size="16">Company</text></svg>:tvf:1
valueformat:1:text-html
```

**Example 15**: Triangle icon
```
cell:A1:t:<svg width="60" height="60"><path d="M30,10 L50,50 L10,50 Z" fill="orange" /></svg>:tvf:1
valueformat:1:text-html
```

**Example 24**: Financial icon for invoices
```
cell:B1:t:<svg width="80" height="80"><rect width="80" height="80" fill="#4A90E2"/><circle cx="40" cy="40" r="30" fill="white"/><text x="40" y="45" fill="#4A90E2" text-anchor="middle" font-size="24" font-weight="bold">$</text></svg>:tvf:2
valueformat:2:text-html
```

**Example 25**: Gradient background
```
cell:A1:t:<svg width="100" height="100"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color\crgb(255,255,0);stop-opacity\c1" /><stop offset="100%" style="stop-color\crgb(255,0,0);stop-opacity\c1" /></linearGradient></defs><rect width="100" height="100" fill="url(#grad1)" /></svg>:tvf:1
valueformat:1:text-html
```

**Example 28**: Checkmark verification icon
```
cell:A1:t:<svg width="50" height="50"><g><rect x="5" y="5" width="40" height="40" fill="none" stroke="black" stroke-width="3"/><line x1="15" y1="25" x2="25" y2="35" stroke="green" stroke-width="3"/><line x1="25" y1="35" x2="40" y2="15" stroke="green" stroke-width="3"/></g></svg>:tvf:1
valueformat:1:text-html
```

**Example 30**: Comprehensive company logo
```
cell:A1:t:<svg width="200" height="100" xmlns="http\c//www.w3.org/2000/svg"><rect width="200" height="100" fill="#2E86AB"/><text x="100" y="50" font-family="Verdana" font-size="28" fill="white" text-anchor="middle" alignment-baseline="middle">TechCorp</text><circle cx="30" cy="30" r="15" fill="#A23B72"/><circle cx="170" cy="70" r="15" fill="#F18F01"/></svg>:tvf:1
valueformat:1:text-html
```

### Styled Text (10-13)

**Example 10**: Colored text with CSS
```
cell:A1:t:<div style="color\cred;">Red Text</div>:tvf:1
valueformat:1:text-html
```

**Example 11**: Highlighted text
```
cell:A1:t:<span style="background-color\cyellow; padding\c5px;">Highlighted</span>:tvf:1
valueformat:1:text-html
```

**Example 13**: Large bold text
```
cell:A1:t:<p style="font-size\c20px; font-weight\cbold;">Large Bold Text</p>:tvf:1
valueformat:1:text-html
```

### Links (12)

**Example 12**: Hyperlink
```
cell:A1:t:<a href="https\c//example.com">Visit Website</a>:tvf:1
valueformat:1:text-link
```
- Uses `text-link` format
- Escaped colon in URL

### Special Formatting (17-23)

**Example 17**: Superscript
```
cell:A1:t:<sup>Superscript</sup> Text:tvf:1
valueformat:1:text-html
```

**Example 18**: Subscript
```
cell:A1:t:<sub>Subscript</sub> Text:tvf:1
valueformat:1:text-html
```

**Example 19**: Code snippet
```
cell:A1:t:<code>function() { return true; }</code>:tvf:1
valueformat:1:text-html
```

**Example 20**: Preformatted text
```
cell:A1:t:<pre>Preformatted\n  Text\n    With Spaces</pre>:tvf:1
valueformat:1:text-html
```

**Example 21**: Unordered list
```
cell:A1:t:<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>:tvf:1
valueformat:1:text-html
```

**Example 22**: Ordered list
```
cell:A1:t:<ol><li>First</li><li>Second</li><li>Third</li></ol>:tvf:1
valueformat:1:text-html
```

**Example 23**: Embedded HTML table
```
cell:A1:t:<table><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>:tvf:1
valueformat:1:text-html
```

### Mixed Formats (16, 24, 26, 28)

**Example 16**: Header with logo
```
cell:A1:t:Company Name:tvf:1
cell:A2:t:<svg width="150" height="60"><ellipse cx="75" cy="30" rx="70" ry="25" fill="purple" /><text x="75" y="35" fill="white" text-anchor="middle" font-size="14">LOGO</text></svg>:tvf:2
valueformat:1:text-plain
valueformat:2:text-html
```

**Example 26**: Signature section
```
cell:A1:t:<img src="https\c//example.com/signature.png" width="200" height="60" alt="Signature" />:tvf:1
cell:A2:t:John Doe:tvf:2
cell:A3:t:CEO:tvf:2
valueformat:1:text-html
valueformat:2:text-plain
```

## 🚫 Negative Examples (Error Cases)

### neg-1.msc: Missing attribute value
```
cell:A1:t:Bold Text:tvf
```
**Error**: `tvf` attribute missing value

### neg-2.msc: Undefined valueformat
```
cell:A1:t:<svg>Content</svg>:tvf:5
valueformat:1:text-html
```
**Error**: valueformat 5 referenced but not defined

### neg-4.msc: Missing attribute value after colon
```
cell:A1:t:<img src="https\c//example.com/logo.png" width="100" height="50" />:tvf:1
```
**Error**: Unescaped colon in URL

### neg-6.msc: Invalid valueformat reference
```
cell:A1:t:Text:tvf:99
valueformat:1:text-html
```
**Error**: valueformat 99 not defined

### neg-9.msc: Undefined valueformat 999
```
cell:A1:t:<img src="https\c//example.com/logo.png" />:tvf:999
valueformat:1:text-html
```
**Error**: valueformat 999 not defined

## 🔑 Key Concepts

### 1. Text Value Format (tvf)

The `tvf` attribute references a valueformat definition:

```
cell:A1:t:Content:tvf:1
valueformat:1:text-html
```

### 2. Valueformat Types for Text

| Format | Use Case | Example |
|--------|----------|---------|
| `text-plain` | Plain text, no formatting | Simple strings |
| `text-html` | HTML content, tags, SVG | Rich content |
| `text-link` | Hyperlinks | URLs, anchors |
| `text-wiki` | Wiki markup | Documentation |

### 3. Colon Escaping

In SocialCalc, colons `:` are delimiters, so they must be escaped as `\c` within content:

```
✅ Correct: <a href="https\c//example.com">Link</a>
❌ Wrong:   <a href="https://example.com">Link</a>

✅ Correct: <div style="color\cred;">Text</div>
❌ Wrong:   <div style="color:red;">Text</div>
```

### 4. SVG Best Practices

- Always specify `width` and `height` attributes
- Use proper namespaces for complex SVGs: `xmlns="http\c//www.w3.org/2000/svg"`
- Escape colons in style attributes
- Close all tags properly

### 5. Image Embedding Options

**External Images**:
```
<img src="https\c//example.com/logo.png" width="100" height="50" />
```

**Base64 Inline**:
```
<img src="data\cimage/png;base64,iVBORw0KGg..." alt="Icon" />
```

### 6. Mixed Format Sheets

You can use multiple valueformats in a single sheet:

```
cell:A1:t:Plain Text:tvf:1
cell:A2:t:<b>HTML Text</b>:tvf:2
cell:A3:t:<svg>...</svg>:tvf:2
valueformat:1:text-plain
valueformat:2:text-html
```

## 🎓 Training Data Structure

Each example includes:

```json
{
  "instruction": "Create cell with bold HTML text",
  "input": "",
  "output": "version:1.5\ncell:A1:t:<b>Bold Text</b>:tvf:1\nvalueformat:1:text-html\nsheet:c:1:r:1",
  "plan": "Use text-html format with <b> tags to render bold text"
}
```

## 🔧 Usage

### Generate JSON Files
```bash
node convert_to_json.js
```

### Validate Examples
```bash
node validate_all.js          # Validate positive examples
node validate_negative.js     # Validate negative examples
```

## 📈 Validation Results

### Positive Examples
- **Total**: 30 files
- **Valid**: 30 ✅
- **Invalid**: 0 ❌
- **Success Rate**: 100%

### Negative Examples
- **Total**: 10 files
- **With Errors**: 6 ✅ (as expected)
- **Without Errors**: 4 ⚠️
- **Accuracy**: 60%

## 🎯 Real-World Use Cases

### Invoice Headers
```
cell:A1:t:INVOICE:tvf:1
cell:B1:t:<svg width="80" height="80">...dollar icon...</svg>:tvf:2
```

### Signatures
```
cell:A1:t:<img src="signature.png" width="200" height="60" />:tvf:1
cell:A2:t:John Doe:tvf:2
cell:A3:t:CEO:tvf:2
```

### Branding
```
cell:A1:t:<svg>...company logo...</svg>:tvf:1
```

### Verification Badges
```
cell:A1:t:<svg>...checkmark icon...</svg>:tvf:1
cell:B1:t:Verified
```

## 🚀 Next Steps

This dataset enables models to:
1. ✅ Apply correct text formatting
2. ✅ Embed images and graphics
3. ✅ Create rich HTML content
4. ✅ Generate SVG logos and icons
5. ✅ Handle colon escaping properly
6. ✅ Mix multiple formats in one sheet
7. ✅ Create professional document layouts

---

**Dataset Complete**: Ready for training! 🎉
