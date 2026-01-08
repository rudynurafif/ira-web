/**
 * Hanya izinkan huruf, spasi, titik, kutip tunggal, dan tanda hubung
 * Cocok untuk: nama lengkap, voucher code
 */
export const sanitizeName = (input: string): string => {
  return input.replace(/[^a-zA-Z\s.'-]/g, "");
};

/**
 * Hanya izinkan karakter valid dalam email (ASCII saja, tanpa spasi/emoji)
 */
export const sanitizeEmail = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9@._-]/g, "");
};

/**
 * Hanya izinkan karakter umum dalam alamat lengkap:
 * huruf, angka, spasi, . , - / ' # ( ) :
 */
export const sanitizeAddress = (input: string): string => {
  // Ganti newline/tab dengan spasi, lalu filter karakter
  return input
    .replace(/[\r\n\t]+/g, " ") // normalisasi whitespace
    .replace(/[^a-zA-Z0-9\s.,\-/'#():]/g, "");
};

/**
 * Hanya izinkan karakter alfanumerik (huruf dan angka)
 * Cocok untuk: kode promo, serial number, username (tanpa simbol), dll.
 */
export const sanitizeAlphanumeric = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9]/g, "");
};
