# ALIGNMENT PROPERTIES REFERENCE

## PROPERTY TYPES

### 1. HORIZONTAL ALIGNMENT (cellformat)
**Syntax**: `cellformat:<id>:<value>`
**Values**: `left` | `center` | `right`
**Cell Reference**: `cf:<id>`

### 2. VERTICAL ALIGNMENT (layout)
**Syntax**: `layout:<id>:padding:<top> <right> <bottom> <left>;vertical-align:<value>;`
**Values**: `top` | `middle` | `bottom`
**Cell Reference**: `l:<id>`
**Padding**: Use `*` for default, `10px` for specific value

---

## QUICK SYNTAX

```
# Define
cellformat:1:left
cellformat:2:center
cellformat:3:right
layout:1:padding:* * * *;vertical-align:top;
layout:2:padding:* * * *;vertical-align:middle;
layout:3:padding:* * * *;vertical-align:bottom;

# Apply
cell:A1:t:Text:cf:1           # Horizontal only
cell:A1:t:Text:l:1            # Vertical only
cell:A1:t:Text:cf:1:l:1       # Both
```

---

## VALUE REFERENCE

### Horizontal (cellformat)
| Value | Use For |
|-------|---------|
| `left` | Text, labels, names, descriptions |
| `center` | Titles, headers, indicators |
| `right` | Numbers, currency, dates, percentages |

### Vertical (layout)
| Value | Use For |
|-------|---------|
| `top` | Headers, form labels |
| `middle` | General content, icons (default choice) |
| `bottom` | Footers, totals |

---

## CONTENT TYPE RULES

| Content | Horizontal | Vertical |
|---------|------------|----------|
| Text/Names | left | middle |
| Numbers/Currency | right | middle |
| Titles | center | middle |
| Headers | center/left | middle |
| Body text | left | top/middle |
| Footers/Totals | right | bottom |

---

## 9 POSITION COMBINATIONS

| Position | H | V | Syntax |
|----------|---|---|--------|
| Top-Left | left | top | `cf:1:l:1` |
| Top-Center | center | top | `cf:2:l:1` |
| Top-Right | right | top | `cf:3:l:1` |
| Middle-Left | left | middle | `cf:1:l:2` |
| Middle-Center | center | middle | `cf:2:l:2` |
| Middle-Right | right | middle | `cf:3:l:2` |
| Bottom-Left | left | bottom | `cf:1:l:3` |
| Bottom-Center | center | bottom | `cf:2:l:3` |
| Bottom-Right | right | bottom | `cf:3:l:3` |

---

## COMMON PATTERNS

### Standard Table
```
cell:A1:t:Name:cf:1:l:1          # Header left
cell:B1:t:Price:cf:2:l:1         # Header right
cell:A2:t:Product:cf:1:l:2       # Data left
cell:B2:v:99.99:cf:2:l:2         # Data right
cellformat:1:left
cellformat:2:right
layout:1:padding:8px * * 8px;vertical-align:middle;
layout:2:padding:5px * * 5px;vertical-align:middle;
```

### Invoice Header
```
cell:A1:t:Company:cf:1:l:1       # Centered title
cell:A2:t:Invoice #123:cf:2:l:2  # Right-aligned number
cellformat:1:center
cellformat:2:right
layout:1:padding:10px * * *;vertical-align:top;
layout:2:padding:* 10px * *;vertical-align:top;
```

### Document
```
cell:A1:t:TITLE:cf:1             # Centered title
cell:A2:t:Content:cf:2           # Left body
cellformat:1:center
cellformat:2:left
```

### Multi-Column Header
```
cell:A1:t:Left:cf:1:l:1
cell:B1:t:Center:cf:2:l:1
cell:C1:t:Right:cf:3:l:1
cellformat:1:left
cellformat:2:center
cellformat:3:right
layout:1:padding:5px * * *;vertical-align:middle;
```

---

## PADDING SYNTAX

Format: `padding:<top> <right> <bottom> <left>;`

```
padding:* * * *;              # All default
padding:10px * * *;           # Top only
padding:* 15px * *;           # Right only
padding:5px 10px * *;         # Top + right
padding:5px 10px 5px 10px;    # All sides
```

---

## COMPLETE EXAMPLES

### Example 1: 3×3 Grid (All Combinations)
```
version:1.5
cell:A1:t:Top Left:cf:1:l:1
cell:B1:t:Top Center:cf:2:l:1
cell:C1:t:Top Right:cf:3:l:1
cell:A2:t:Middle Left:cf:1:l:2
cell:B2:t:Middle Center:cf:2:l:2
cell:C2:t:Middle Right:cf:3:l:2
cell:A3:t:Bottom Left:cf:1:l:3
cell:B3:t:Bottom Center:cf:2:l:3
cell:C3:t:Bottom Right:cf:3:l:3
sheet:c:3:r:3
cellformat:1:left
cellformat:2:center
cellformat:3:right
layout:1:padding:* * * *;vertical-align:top;
layout:2:padding:* * * *;vertical-align:middle;
layout:3:padding:* * * *;vertical-align:bottom;
```

### Example 2: Employee Table
```
version:1.5
cell:A1:t:Name:cf:1:l:1
cell:B1:t:Department:cf:1:l:1
cell:C1:t:Salary:cf:2:l:1
cell:A2:t:John Doe:cf:1:l:2
cell:B2:t:Engineering:cf:1:l:2
cell:C2:v:75000:cf:2:l:2
sheet:c:3:r:2
cellformat:1:left
cellformat:2:right
layout:1:padding:8px * * 8px;vertical-align:middle;
layout:2:padding:5px * * 5px;vertical-align:middle;
```

### Example 3: Report with Spanning Header
```
version:1.5
cell:A1:t:Quarter Report:cf:1:l:1:colspan:4
cell:A2:t:Q1:cf:1:l:2
cell:B2:t:Q2:cf:1:l:2
cell:C2:t:Q3:cf:1:l:2
cell:D2:t:Q4:cf:1:l:2
cell:A3:v:1250:cf:2:l:2
cell:B3:v:1380:cf:2:l:2
cell:C3:v:1420:cf:2:l:2
cell:D3:v:1560:cf:2:l:2
sheet:c:4:r:3
cellformat:1:center
cellformat:2:right
layout:1:padding:15px * 10px *;vertical-align:middle;
layout:2:padding:5px * * *;vertical-align:middle;
```

---

## KEY RULES

1. **Text → left, Numbers → right, Titles → center**
2. **Default vertical: middle** (most cases)
3. **Define once, reuse with IDs** (consistency)
4. **Same alignment in column** (visual consistency)
5. **Padding with vertical** (spacing control)
6. **Both can be combined** (9 positions available)
