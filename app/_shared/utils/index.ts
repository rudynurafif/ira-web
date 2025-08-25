export function convertToCurrency(
  number: number,
  locale = "id-ID",
  currency = "IDR"
) {
  if (number) {
    return number.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    });
  } else {
    return "";
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
