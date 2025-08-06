# AI Parser Enhancement - Table Data Support

The AI parser has been enhanced to support structured lists and tabular data extraction.

## ✅ **New Capabilities**

### **Table Data Extraction**
- **Bank Statements**: Date, Description, Debit, Credit, Balance
- **Invoices**: Item, Quantity, Unit Price, Amount  
- **Receipts**: Item, Quantity, Price, Total
- **Any Tabular Data**: Custom column mapping

### **Enhanced Data Types**
- Added `'list'` and `'table'` to field types
- New `TableData` schema with headers, rows, and summary
- Row-level confidence scoring
- Mathematical validation (totals, balances)

### **Smart Detection**
- Automatically identifies tabular structures
- Extracts complete table data with proper column mapping
- Maintains relationships between data elements
- Calculates summary statistics

## **Usage Example**

```typescript
import { documentParser } from '@/lib/ai/parser'

const result = await documentParser.parseDocument(bankStatementText)

// Access extracted table data
const tables = result.structured_data.tables || []

tables.forEach(table => {
  console.log(`${table.name}: ${table.rows.length} transactions`)
  
  table.rows.forEach(row => {
    const { Date, Description, Debit, Credit } = row.data
    console.log(`${Date}: ${Description} - ${Debit || Credit}`)
  })
  
  if (table.summary?.total_amount) {
    console.log(`Total: ${table.summary.total_amount}`)
  }
})
```

## **Output Structure**

```typescript
{
  structured_data: {
    // ... existing fields
    tables: [
      {
        name: "Transaction History",
        headers: ["Date", "Description", "Debit", "Credit", "Balance"],
        rows: [
          {
            id: "1",
            data: {
              "Date": "2024-01-15",
              "Description": "ATM Withdrawal",
              "Debit": "$50.00",
              "Credit": "",
              "Balance": "$1,450.00"
            },
            confidence: 95
          }
        ],
        summary: {
          total_rows: 25,
          total_amount: "$500.00",
          date_range: {
            start: "2024-01-01",
            end: "2024-01-31"
          }
        }
      }
    ]
  }
}
```

## **Benefits**

✅ **Complete Data Extraction**: Captures all tabular information  
✅ **Structured Output**: Properly formatted JSON with column mapping  
✅ **Data Validation**: Mathematical checks and relationship validation  
✅ **Flexible Schema**: Supports any table structure  
✅ **Confidence Scoring**: Row-level extraction confidence  
✅ **Summary Statistics**: Automatic calculation of totals and ranges  

The enhanced parser now handles complex financial documents like bank statements with complete transaction lists, making them fully searchable and processable.