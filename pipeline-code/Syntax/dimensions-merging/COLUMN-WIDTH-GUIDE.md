# Column Width & Margin Best Practices Guide

## 📐 Design Principles

### Margin Column (Column A)
**Always reserve Column A for left margin:**
- Width: 25-30 pixels
- Purpose: Visual breathing room, document aesthetics
- Never place content in column A (row 1 is also reserved for top margin)

### Starting Position
**Content should start at cell B2:**
- Row 1: Reserved for top margin
- Column A: Reserved for left margin
- Cell B2: First content cell
- Creates professional document layout

## 🎯 Column Width Guidelines

### Standard Widths by Content Type

| Content Type | Recommended Width | Example |
|--------------|-------------------|---------|
| Margin (Col A) | 25-30px | Left spacing |
| ID/Number | 60-80px | 001, ID |
| Short Label | 80-100px | Mon, Q1 |
| Standard Text | 100-150px | Name, Date |
| Long Text | 150-250px | Address, Title |
| Description | 250-400px | Product description |
| Email | 250-300px | email@example.com |

## 📋 Examples from Training Data

### Example 51: Simple Table with Varying Widths
```
col:A:w:30      # Margin
col:B:w:100     # Header
col:C:w:200     # Content (wider)
col:D:w:150     # Details
```
Start content at B2, not A1.

### Example 52: Product Table with Wide Description
```
col:A:w:30      # Margin
col:B:w:80      # Name
col:C:w:300     # Description (extra wide)
col:D:w:100     # Price
col:E:w:80      # Stock
```
Description column (C) is 3x wider than name column (B).

### Example 53: Dashboard with Equal Columns
```
col:A:w:25      # Margin (slightly smaller)
col:B:w:120     # Metric 1
col:C:w:120     # Metric 2 (same width)
col:D:w:120     # Metric 3 (same width)
col:E:w:120     # Metric 4 (same width)
```
Equal widths create visual balance for similar content.

### Example 54: Contact List with Email Column
```
col:A:w:30      # Margin
col:B:w:60      # ID (narrow)
col:C:w:120     # First Name
col:D:w:120     # Last Name
col:E:w:250     # Email (widest)
col:F:w:120     # Phone
```
Email needs more space (250px) than names (120px).

### Example 55: Invoice with Description Area
```
col:A:w:30      # Margin
col:B:w:300     # Description (dominant column)
col:C:w:80      # Quantity (narrow)
col:D:w:100     # Price
```
Description dominates the layout at 300px.

### Example 56: Weekly Schedule
```
col:A:w:30      # Margin
col:B:w:80      # Time label
col:C:w:100     # Monday
col:D:w:100     # Tuesday
col:E:w:100     # Wednesday
col:F:w:100     # Thursday
col:G:w:80      # Weekend (slightly less)
```
Consistent day columns create clean grid.

### Example 57: Report with Equal Sections
```
col:A:w:30      # Margin
col:B:w:150     # Section 1
col:C:w:150     # Section 2
col:D:w:150     # Section 3
col:E:w:150     # Section 4
```
Four equal sections for balanced report layout.

### Example 58: Web Layout
```
col:A:w:30      # Margin
col:B:w:120     # Navigation (narrow sidebar)
col:C:w:200     # Main content
col:D:w:200     # Main content
col:E:w:200     # Main content
```
Sidebar narrower than main content area.

### Example 59: Quarterly Data
```
col:A:w:30      # Margin
col:B:w:100     # Label column
col:C:w:100     # Q1
col:D:w:100     # Q2
col:E:w:100     # Q3
col:F:w:100     # Q4
```
All data columns same width for alignment.

### Example 60: Company Profile
```
col:A:w:30      # Margin
col:B:w:150     # Department
col:C:w:180     # Manager (wider for full names)
col:D:w:120     # Team Size
```
Manager column wider to accommodate full names.

## ✅ Best Practices Checklist

### Always Do:
- ✅ Set column A width to 25-30px for margin
- ✅ Start content at cell B2 (not A1)
- ✅ Define width for all visible columns
- ✅ Use wider columns for descriptive text
- ✅ Use narrower columns for IDs, numbers, short labels
- ✅ Match column widths to content length

### Never Do:
- ❌ Place content in column A
- ❌ Place content in row 1
- ❌ Start design at A1
- ❌ Skip the margin column
- ❌ Use same width for all columns
- ❌ Make narrow columns for long text

## 🎨 Layout Patterns

### Pattern 1: List/Table Layout
```
Margin (30px) | ID (60px) | Name (150px) | Details (200px)
     A              B            C               D
```

### Pattern 2: Dashboard Layout
```
Margin (30px) | Metric 1 (120px) | Metric 2 (120px) | Metric 3 (120px)
     A                B                  C                  D
```

### Pattern 3: Form Layout
```
Margin (30px) | Label (100px) | Input Field (300px)
     A               B                 C
```

### Pattern 4: Document Layout
```
Margin (30px) | Sidebar (120px) | Content (200px) | Content (200px)
     A               B                 C               D
```

## 📏 Width Calculation Tips

### By Character Count
- Approximate: 10px per character
- Example: "Product Description" (19 chars) ≈ 190-200px

### By Content Type
- **Numeric IDs**: 60-80px (5-8 characters)
- **Names**: 120-150px (12-15 characters)
- **Emails**: 250-300px (25-30 characters)
- **Descriptions**: 300-400px (30-40 characters)

### Responsive Sizing
- Small screen: Reduce all widths proportionally
- Large screen: Increase content columns, keep margin at 30px
- Print layout: Optimize for paper width

## 🔧 Implementation

### Basic Structure
```
version:1.5
cell:B2:t:Title:colspan:3
cell:C2:t:
cell:D2:t:
cell:B3:t:Data 1
cell:C3:t:Data 2
cell:D3:t:Data 3
sheet:c:4:r:4
col:A:w:30      # Always define margin
col:B:w:100
col:C:w:150
col:D:w:200
```

### With Row Heights (Optional)
```
col:A:w:30      # Margin column
col:B:w:150
col:C:w:200
row:1:h:20      # Top margin
row:2:h:30      # Header row (taller)
```

## 💡 Key Takeaways

1. **Column A = Margin** (25-30px) - Never put content here
2. **Row 1 = Margin** - Never put content here
3. **Start at B2** - First content cell
4. **Vary widths** - Match width to content needs
5. **Consistency** - Similar content = similar widths
6. **Balance** - Wide columns for text, narrow for IDs

## 📚 Related Examples

- Examples 1-50: Focus on cell merging and spanning
- Examples 51-60: Focus on column widths with margins
- All examples: Start content at B2 with column A as margin

---

**Remember**: Professional documents always have margins. Column A (30px) and Row 1 create that professional appearance.
