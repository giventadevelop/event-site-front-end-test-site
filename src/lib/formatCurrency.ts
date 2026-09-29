export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Display competition / registration fees; zero amounts show as Free. */
export function formatCompetitionFee(amount: number, currency = 'USD'): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';
  return formatCurrency(amount, currency);
}
