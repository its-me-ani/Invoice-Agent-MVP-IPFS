# SocialCalc Command Reference

## Overview

SocialCalc supports a command-based interface for manipulating spreadsheets. Commands can be executed programmatically through the `ExecuteCommand` or `EditorScheduleSheetCommands` methods.

## Command Execution Methods

### JavaScript API

```javascript
// Method 1: Using spreadsheet control
spreadsheet.ExecuteCommand(commandString, '');

// Method 2: Using editor
spreadsheet.editor.EditorScheduleSheetCommands(commandString, saveUndo, isRemote);

// Method 3: Using sheet directly  
sheet.ScheduleSheetCommands(commandString, saveUndo, isRemote);
```

### Command String Placeholders

When using command strings, these placeholders are available:
- `%C` - Current cell or range (e.g., "A1" or "A1:B5")
- `%S` - Value/parameter string
- `%N` - Newline (for chaining multiple commands)
- `%W` - Column identifier
- `%R` - Range identifier

---

## Cell Content Commands

### set [cell/range] value [type] [value]
Set a cell's numeric value with type specifier.
Type: n=number, nd=date, nt=time, n$=currency, nl=logical, ne=error
```
set A1 value n 100
set B2 value n 42.5
set C1 value n$ 1500
```

### set [cell/range] text [type] [text]
Set a cell's text value with type specifier.
Type: t=text, th=text-html
```
set A1 text t Hello World
set B2 text t Invoice #123
```

### set [cell/range] formula [formula]
Set a cell's formula.
```
set A1 formula SUM(B1:B10)
set C5 formula A5*B5
set D1 formula IF(A1>100,"High","Low")
```

### set [cell/range] constant [type] [value] [display]
Set a cell's constant value with type info.
```
set A1 constant n 42 42
set B1 constant t Hello Hello
```

### set [cell/range] empty
Clear a cell's value (make it blank).
```
set A1 empty
set B2:D10 empty
```

### set [cell/range] all [:type:value...]
Set all properties of a cell in save format.
```
set A1 all :v:100:f:1:c:2
```

---

## Cell Formatting Commands

### set [cell/range] bt/br/bb/bl [border-style]
Set cell borders (top/right/bottom/left).
```
set A1 bt 1px solid rgb(0,0,0)
set A1:D1 bb 2px solid rgb(0,0,255)
set B2 br 
```
Border style format: `[width] [style] [color]` or empty to remove.

### set [cell/range] color [color]
Set text color.
```
set A1 color rgb(255,0,0)
set B1:B10 color rgb(0,0,255)
set C1 color 
```

### set [cell/range] bgcolor [color]
Set background color.
```
set A1 bgcolor rgb(255,255,0)
set B1:D1 bgcolor rgb(200,200,200)
```

### set [cell/range] font [font-style]
Set cell font. Format: `[style] [weight] [size] [family]`
Use `*` for default values.
```
set A1 font * bold * *
set B1 font italic normal 14pt Arial
set C1 font normal bold 12pt Times New Roman
set D1 font * * * 
```

### set [cell/range] cellformat [alignment]
Set horizontal alignment.
```
set A1 cellformat left
set B1 cellformat center
set C1 cellformat right
set D1 cellformat 
```

### set [cell/range] layout [layout-num]
Set cell layout (vertical alignment and padding).
```
set A1 layout 1
```

### set [cell/range] nontextvalueformat [format]
Set number format for numeric values.
```
set A1 nontextvalueformat #,##0.00
set B1 nontextvalueformat $#,##0.00
set C1 nontextvalueformat 0%
set D1 nontextvalueformat 0.00E+00
```

### set [cell/range] textvalueformat [format]
Set format for text values.
```
set A1 textvalueformat text-html
set B1 textvalueformat text-wiki
set C1 textvalueformat text-plain
```

### set [cell/range] cssc [class-name]
Set custom CSS class for cell.
```
set A1 cssc highlight
set B1:B10 cssc important
```

### set [cell/range] csss [style-string]
Set custom CSS style for cell.
```
set A1 csss text-decoration:underline
set B1 csss font-style:oblique
```

### set [cell/range] comment [text]
Set cell comment.
```
set A1 comment This is a note about this cell
```

---

## Column Commands

### set [column(s)] width [width]
Set column width.
```
set A width 100
set B width 150
set C:E width 80
set F width auto
```

### set [column(s)] hide [yes/no]
Hide or show columns.
```
set A hide yes
set B hide no
```

---

## Row Commands

### set [row] height [height]
Set row height.
```
set 1 height 30
set 5 height 50
```

### set [row] hide [yes/no]
Hide or show rows.
```
set 1 hide yes
set 5 hide no
```

---

## Sheet Attribute Commands

### set sheet defaultcolwidth [width]
Set default column width.
```
set sheet defaultcolwidth 100
```

### set sheet defaultcolor [color]
Set default text color for sheet.
```
set sheet defaultcolor rgb(0,0,0)
```

### set sheet defaultbgcolor [color]
Set default background color for sheet.
```
set sheet defaultbgcolor rgb(255,255,255)
```

### set sheet defaultfont [font]
Set default font for sheet.
```
set sheet defaultfont * * 12pt Arial
```

### set sheet defaulttextformat [format]
Set default alignment for text values.
```
set sheet defaulttextformat left
```

### set sheet defaultnontextformat [format]
Set default alignment for numeric values.
```
set sheet defaultnontextformat right
```

### set sheet defaulttextvalueformat [format]
Set default text value format.
```
set sheet defaulttextvalueformat text-plain
```

### set sheet defaultnontextvalueformat [format]
Set default number format.
```
set sheet defaultnontextvalueformat General
```

### set sheet lastcol [num]
Set last used column.
```
set sheet lastcol 10
```

### set sheet lastrow [num]
Set last used row.
```
set sheet lastrow 100
```

### set sheet recalc [on/off]
Enable or disable auto recalculation.
```
set sheet recalc off
set sheet recalc on
```

---

## Edit Commands

### copy [range] [all/formulas/formats]
Copy cells to clipboard.
```
copy A1:B5 all
copy A1:D10 formulas
copy B2:E8 formats
```

### cut [range] [all/formulas/formats]
Cut cells to clipboard.
```
cut A1:B5 all
cut A1:D10 formulas
```

### paste [destination] [all/formulas/formats]
Paste from clipboard.
```
paste A10 all
paste C1 formulas
paste D5 formats
```

### erase [range] [all/formulas/formats]
Erase cell contents.
```
erase A1:B5 all
erase A1:D10 formulas
erase B2 formats
```

### filldown [range] [all/formulas/formats]
Fill cells downward from top row.
```
filldown A1:A10 all
filldown B1:D20 formulas
```

### fillright [range] [all/formulas/formats]
Fill cells rightward from left column.
```
fillright A1:E1 all
fillright A5:F5 formulas
```

---

## Structure Commands

### merge [range]
Merge cells into one.
```
merge A1:C1
merge B2:D5
```

### unmerge [cell]
Unmerge previously merged cells.
```
unmerge A1
unmerge B2
```

### insertrow [cell]
Insert a new row at the specified position.
```
insertrow A5
insertrow B10
```

### insertcol [cell]
Insert a new column at the specified position.
```
insertcol C1
insertcol E5
```

### deleterow [range]
Delete row(s).
```
deleterow A5
deleterow A5:A10
```

### deletecol [range]
Delete column(s).
```
deletecol C1
deletecol C1:E1
```

---

## Move Commands

### movepaste [source-range] [destination] [all/formulas/formats]
Move cells to new location (overwriting destination).
```
movepaste A1:B5 D1 all
movepaste C3:E10 A20 formulas
```

### moveinsert [source-range] [destination] [all/formulas/formats]
Move cells, inserting at destination (shifting existing cells).
```
moveinsert A1:B5 D1 all
moveinsert C3:C10 A3 all
```

---

## Sort Command

### sort [range] [col1] [up/down] [col2] [up/down] [col3] [up/down]
Sort a range by up to 3 columns.
```
sort A1:D10 A up
sort A1:D100 B down A up
sort B2:F50 C up D down E up
```

---

## Named Ranges

### name define [name] [definition]
Define a named range or formula.
```
name define TOTAL B10
name define ITEMS A1:A100
name define TAX_RATE =0.08
name define GRAND_TOTAL =SUM(ITEMS)*TAX_RATE
```

### name desc [name] [description]
Add description to a named range.
```
name desc TOTAL The total amount
name desc ITEMS List of all items
```

### name delete [name]
Delete a named range.
```
name delete TOTAL
name delete ITEMS
```

---

## Clipboard Commands

### loadclipboard [data]
Load data into clipboard (encoded format).
```
loadclipboard version:1.5\ncell:A1:v:100
```

### clearclipboard
Clear the clipboard.
```
clearclipboard
```

---

## Recalculation Commands

### recalc
Force recalculation of all formulas.
```
recalc
```

### redisplay
Force redisplay of the sheet.
```
redisplay
```

---

## Undo/Redo Commands

### undo
Undo the last operation.
```
undo
```

### redo
Redo the last undone operation.
```
redo
```

---

## Extension Commands

### startcmdextension [extension-name] [parameters...]
Execute a registered command extension.
```
startcmdextension myextension param1 param2
```

---

## Command Chaining

Multiple commands can be chained using newlines:
```
set A1 value 100
set A1 bgcolor rgb(255,255,0)
set A1 font * bold * *
recalc
```

Or using the %N placeholder in JavaScript:
```javascript
spreadsheet.ExecuteCommand('set A1 value 100%Nset A1 bgcolor rgb(255,255,0)', '');
```

---

## Common Value Formats

### Number Formats
- `General` - Default format
- `0` - Integer
- `0.00` - Two decimal places
- `#,##0` - Thousands separator
- `#,##0.00` - Thousands with decimals
- `$#,##0.00` - Currency
- `0%` - Percentage
- `0.00E+00` - Scientific notation

### Date Formats
- `yyyy-mm-dd` - ISO date
- `mm/dd/yyyy` - US date
- `dd/mm/yyyy` - European date

### Color Values
- `rgb(r,g,b)` - RGB color (values 0-255)
- Named colors in some contexts

### Font Styles
Format: `[style] [weight] [size] [family]`
- style: `normal`, `italic`, `oblique`, `*`
- weight: `normal`, `bold`, `*`
- size: e.g., `12pt`, `14px`, `*`
- family: e.g., `Arial`, `Times New Roman`, `*`

---

## Examples

### Create a Basic Invoice Header
```
set B2 text INVOICE
set B2 font * bold 24pt Arial
set B2 cellformat center
merge B2:F2
set B3 text Invoice #:
set C3 text INV-001
set B4 text Date:
set C4 text 2024-01-15
```

### Format a Data Table
```
set A1:E1 bgcolor rgb(50,50,50)
set A1:E1 color rgb(255,255,255)
set A1:E1 font * bold * *
set A1 text Item
set B1 text Description
set C1 text Qty
set D1 text Price
set E1 text Total
set E2:E100 formula D{row}*C{row}
```

### Add Borders to a Range
```
set A1:E10 bt 1px solid rgb(0,0,0)
set A1:E10 br 1px solid rgb(0,0,0)
set A1:E10 bb 1px solid rgb(0,0,0)
set A1:E10 bl 1px solid rgb(0,0,0)
```

### Clear and Reset a Section
```
erase A1:Z100 all
set sheet lastcol 10
set sheet lastrow 20
recalc
redisplay
```
