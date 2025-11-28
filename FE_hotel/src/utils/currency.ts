/**
 * Format number to Vietnamese currency format with thousand separators
 * @param amount - The number to format
 * @returns Formatted string with commas (e.g., "1,990,000")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

/**
 * Format number to Vietnamese currency with VND symbol
 * @param amount - The number to format
 * @returns Formatted string with commas and ₫ symbol (e.g., "1,990,000₫")
 */
export const formatPrice = (amount: number): string => {
  return `${formatCurrency(amount)}₫`;
};

/**
 * Parse Vietnamese formatted number string back to number
 * @param str - String with commas (e.g., "1,990,000")
 * @returns Parsed number
 */
export const parseCurrency = (str: string): number => {
  return parseFloat(str.replace(/[.,]/g, '')) || 0;
};
