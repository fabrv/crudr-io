export function transformType(sqlType: string): string {
  switch (sqlType) {
    case 'int': return 'number'
    case 'varchar': return 'string'
    case 'float': return 'string'
    case 'datetime': return 'Date'
    case 'numeric': return 'number'
    default: return 'string'
  }
}