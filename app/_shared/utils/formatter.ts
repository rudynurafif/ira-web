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
  return input.replace(/[^a-zA-Z0-9\s]/g, "");
};

export const HAS_EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}]/u;
