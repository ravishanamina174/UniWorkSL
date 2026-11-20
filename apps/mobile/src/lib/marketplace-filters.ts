export function colomboDate(offset = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const number = (key: string) => Number(parts.find((part) => part.type === key)?.value);
  return new Date(Date.UTC(number('year'), number('month') - 1, number('day') + offset)).toISOString().slice(0, 10);
}

export function validPriceRange(min?: number, max?: number): boolean {
  return (min === undefined || Number.isFinite(min) && min >= 0)
    && (max === undefined || Number.isFinite(max) && max >= 0)
    && (min === undefined || max === undefined || min <= max);
}
