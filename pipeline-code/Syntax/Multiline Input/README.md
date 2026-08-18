# Multiline Input Training Dataset

## Overview
This dataset contains 10 examples demonstrating multiline text input in SocialCalc using the `\n` escape sequence for line breaks. It covers various use cases including addresses, lists, poems, and formatted sections.

## Statistics
- **Total Examples**: 10 positive examples
- **Validation Status**: ✅ 100% (10/10 valid)
- **Output Files**: 
  - `json/1.json` - `json/10.json` (10 JSON files)
  - `multiline_training.jsonl` (training data)

## Key Features

### Line Break Syntax
```
cell:A1:t:Line 1\nLine 2\nLine 3
```

### Escape Sequences
- `\n` - Newline (line break)
- `\\` - Literal backslash
- Multiple `\n` can be used for blank lines

## Example Coverage

| Example | Description | Lines | Features |
|---------|-------------|-------|----------|
| 1 | Two lines | 2 | Basic line break |
| 2 | Three lines | 3 | Multiple breaks |
| 3 | Bullet list | 3 | List structure |
| 4 | Address | 3 | Formatted address |
| 5 | Mixed content | 5 | Header + content |
| 6 | Numbered list | 4 | Ordered items |
| 7 | Blank lines | 3 | Double \n\n |
| 8 | Poem/verse | 5 | Poetic formatting |
| 9 | Long paragraph | 5 | Multi-line text |
| 10 | Sections | 6 | Multiple sections |

## Training Data Format
Each example in `multiline_training.jsonl` contains:
- **instruction**: Task description for creating multiline content
- **input**: Empty string (no input required)
- **output**: Complete SocialCalc MSC format
- **plan**: Step-by-step approach for multiline formatting

Example entry:
```json
{
  "instruction": "Create cell with three lines of text",
  "input": "",
  "output": "version:1.5\ncell:A1:t:Line 1\\nLine 2\\nLine 3\nsheet:c:1:r:1",
  "plan": "Use multiple \\n escape sequences to separate three lines"
}
```

## Usage

### Generate JSON and Training Data
```bash
node convert_to_json.js
```
This creates:
- `json/` directory with 10 JSON files
- `multiline_training.jsonl` with training examples

### Validate Examples
```bash
node validate_all.js
```

### Validate Negative Examples
```bash
node validate_negative.js
```

## Multiline Syntax Rules

1. **Line Break**: Use `\n` to create line breaks
2. **Blank Lines**: Use `\n\n` for empty lines
3. **Literal Backslash**: Escape as `\\`
4. **No Valueformat**: Plain text cells (type `t`)
5. **Preservation**: Line breaks are preserved in rendering

## Common Patterns

### Simple Two Lines
```
cell:A1:t:First line\nSecond line
```

### Address Format
```
cell:A1:t:123 Main Street\nSpringfield, IL\n62701
```

### Bullet List
```
cell:A1:t:• Item 1\n• Item 2\n• Item 3
```

### Numbered List
```
cell:A1:t:1. First\n2. Second\n3. Third
```

### With Blank Lines
```
cell:A1:t:Header\n\nContent after blank line
```

### Poem Structure
```
cell:A1:t:Roses are red\nViolets are blue\nSugar is sweet\nAnd so are you
```

## Use Cases

### 1. Contact Information
Store multi-line addresses and contact details in single cells.

### 2. Lists
Create bullet points or numbered lists within cells.

### 3. Poetry/Lyrics
Preserve line breaks in creative text.

### 4. Formatted Text
Structure content with headers, body, and footers.

### 5. Notes/Comments
Add multi-line notes or descriptions.

## Validation Results
All 10 examples passed validation:
- ✅ Proper `\n` escape sequences
- ✅ Valid cell references
- ✅ Correct line break counts (1-5 breaks)
- ✅ Appropriate sheet dimensions

## Technical Details

### Rendering
When rendered, `\n` sequences are converted to actual line breaks:
```
Input:  "Line 1\nLine 2"
Output: Line 1
        Line 2
```

### Escaping
Backslashes must be properly escaped:
- `\n` → Line break
- `\\n` → Literal "\n" (backslash + n)
- `\\` → Literal "\"

## Integration
This dataset is part of the SocialCalc Syntax training collection:
- **Format Text** - HTML/SVG/text formatting
- **Alignments** - Cell alignment options
- **Links** - Hyperlink formatting
- **Multiline Input** - Multi-line text with line breaks (this dataset)
