// Parses numbers in accounting format, e.g. "$1,234.56", "(1,234.56)", "$(1,234.56)" → -1234.56 for parens.
export function parseAccountingNumber(rawValue: string): number {
  const trimmed = rawValue.trim();
  if (!trimmed) return 0;

  // A leading currency symbol may sit outside the parens, e.g. "$(1,234.56)".
  const isParenNegative = /^[^0-9]*\(.*\)[^0-9]*$/.test(trimmed);
  const unwrapped = isParenNegative ? `-${trimmed.replace(/[()]/g, '')}` : trimmed;

  // Strip currency symbols, thousand separators, and any other non-numeric noise,
  // keeping only digits, the decimal point, and a leading minus sign.
  const cleaned = unwrapped.replace(/[^0-9.\-]/g, '');

  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}
