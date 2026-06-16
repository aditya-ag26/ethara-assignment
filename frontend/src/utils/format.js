/**
 * Format a number as Indian Rupees (₹).
 * Uses the en-IN locale for proper lakh/crore grouping.
 * Example: formatCurrency(125000) → "₹1,25,000.00"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

/**
 * Format a date in Indian format (DD/MM/YYYY).
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
