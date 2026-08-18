# Links Training Dataset

## Overview
This dataset contains 10 examples demonstrating hyperlink formatting in SocialCalc using the `text-link` valueformat. It covers URLs with different protocols, email links, query parameters, and proper colon escaping.

## Statistics
- **Total Examples**: 10 positive examples
- **Validation Status**: ✅ 100% (10/10 valid)
- **Output Files**: 
  - `json/1.json` - `json/10.json` (10 JSON files)
  - `links_training.jsonl` (training data)

## Key Features

### Link Format
```
cell:A1:t:Display Text<https\c//example.com>:tvf:1
valueformat:1:text-link
```

### Link Behavior Options
- **Current Tab**: `<URL>` - Single angle brackets
- **New Tab**: `<<URL>>` - Double angle brackets

### Format Reference
- `:tvf:1` - References valueformat 1 (text-link)
- Display text comes before the bracketed URL
- URL is enclosed in angle brackets

### Colon Escaping
URLs require colon escaping with `\c` notation:
- `https://example.com` → `https\c//example.com`
- `mailto:user@example.com` → `mailto\cuuser@example.com`

### Supported Protocols
- HTTP/HTTPS - Web links
- FTP - File transfer
- mailto - Email links

## Example Coverage

| Example | Description | Features |
|---------|-------------|----------|
| 1 | Simple link (current tab) | Basic link with single brackets |
| 2 | Multiple links (new tabs) | Double brackets for new tab |
| 3 | Email link | mailto: protocol |
| 4 | GitHub repo (new tab) | Repository link opening in new tab |
| 5 | Colored links | Color formatting with links |
| 6 | Bold link (new tab) | Font styling with link |
| 7 | FTP link | File transfer protocol |
| 8 | Telephone link | Clickable phone number |
| 9 | URL with query params | Query string in new tab |
| 10 | Navigation menu | Mixed current/new tab behaviors |

## Training Data Format
Each example in `links_training.jsonl` contains:
- **instruction**: Task description for creating links
- **input**: Empty string (no input required)
- **output**: Complete SocialCalc MSC format
- **plan**: Step-by-step approach for link formatting

Example entry:
```json
{
  "instruction": "Create basic link that opens in current tab",
  "input": "",
  "output": "version:1.5\ncell:A1:t:Example Site<https\\c//example.com>:tvf:1\nsheet:c:1:r:1\nvalueformat:1:text-link",
  "plan": "Use single angle brackets <URL> with text-link valueformat and tvf:1 reference"
}
```

## Usage

### Generate JSON and Training Data
```bash
node convert_to_json.js
```
This creates:
- `json/` directory with 10 JSON files
- `links_training.jsonl` with training examples

### Validate Examples
```bash
node validate_all.js
```

### Validate Negative Examples
```bash
node validate_negative.js
```

## Link Syntax Rules

1. **Valueformat Declaration**: `valueformat:1:text-link`
2. **Cell Format Reference**: `:tvf:1` links to valueformat 1
3. **Current Tab**: `<URL>` - Single angle brackets
4. **New Tab**: `<<URL>>` - Double angle brackets
5. **Colon Escaping**: Replace `:` with `\c` in URLs
6. **Slash Escaping**: Use `\\` for literal backslashes
7. **Display Text**: Text before angle brackets is the clickable text

## Common Patterns

### Current Tab Link
```
cell:A1:t:Visit Site<https\c//example.com>:tvf:1
valueformat:1:text-link
```

### New Tab Link
```
cell:A1:t:Open in New Tab<<https\c//example.com>>:tvf:1
valueformat:1:text-link
```

### Email Link
```
cell:A1:t:Contact Us<mailto\cuser@example.com>:tvf:1
valueformat:1:text-link
```

### Link with Display Text
```
cell:A1:t:Click Here<<https\c//example.com>>:tvf:1
valueformat:1:text-link
```

### Link with Query String
```
cell:A1:t:Search<<https\c//example.com?query=value&key=123>>:tvf:1
valueformat:1:text-link
```

### Styled Link (with color)
```
color:1:rgb(0,0,255)
cell:A1:t:Blue Link<https\c//example.com>:tvf:1:c:1
valueformat:1:text-link
```

### Styled Link (with font)
```
font:1:* bold * *
cell:A1:t:Bold Link<<https\c//example.com>>:tvf:1:f:1
valueformat:1:text-link
```

## Validation Results
All 10 examples passed validation:
- ✅ Proper valueformat declarations
- ✅ Correct colon escaping
- ✅ Valid URL structures
- ✅ Appropriate sheet dimensions

## Integration
This dataset is part of the SocialCalc Syntax training collection:
- **Format Text** - HTML/SVG/text formatting
- **Alignments** - Cell alignment options
- **Links** - Hyperlink formatting (this dataset)
- **Multiline Input** - Multi-line text with line breaks
