// §11 storage rule: budgets are stored in whatever currency the user entered
// and converted only at display time — never store a converted figure.
export function convertAmount(amount, fromCurrency, toCurrency, rates) {
  if (!rates || fromCurrency === toCurrency) return Number(amount);
  if (!rates[fromCurrency] || !rates[toCurrency]) return Number(amount);
  return (Number(amount) / rates[fromCurrency]) * rates[toCurrency];
}

export function formatCurrency(amount, currency, locale) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
