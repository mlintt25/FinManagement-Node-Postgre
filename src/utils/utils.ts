// Convert DD-MM-YYYY to YYYY-MM-DD
export function convertDateFormat(dateStr: string): string {
  const [day, month, year] = dateStr.split('-')
  return `${year}-${month}-${day}`
}
