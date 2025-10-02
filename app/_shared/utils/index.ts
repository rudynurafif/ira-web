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

export const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0"); // Pastikan menit selalu 2 digit
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0"); // Pastikan detik selalu 2 digit
  return `${minutes}:${remainingSeconds}`;
};

export function addUrlParam(param: string, value: any) {
  const url = new URL(window.location.href);

  url.searchParams.set(param, value);
  window.history.replaceState(null, "", url.toString());
}

export function resetUrlParam(param: string) {
  const url = new URL(window.location.href);

  url.searchParams.delete(param);
  window.history.replaceState(null, "", url.toString());
}

export const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
export const regexEmail =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
