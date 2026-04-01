import { FormType } from "./types/type";

// Urutan field sesuai tampilan form (yang kamu anggap "paling atas")
export const ERROR_ORDER: (keyof FormType)[] = [
  "package_id",
  "fullname",
  "email",
  "phone",
  "otp",
  // "password",
  // "confirm_password",
  "province",
  "city",
  "district",
  "sub_district",
  "rw",
  "rt",
  "postal_code",
  "notes",
  "actual_address",
  "voucher_code",
];

// Label yang rapi untuk toast
export const ERROR_LABEL: Partial<Record<keyof FormType, string>> = {
  package_id: "Paket",
  fullname: "Nama lengkap",
  email: "Email",
  phone: "Nomor handphone",
  // password: "Password",
  // confirm_password: "Konfirmasi Password",
  otp: "OTP",
  province: "Provinsi",
  city: "Kota/Kabupaten",
  district: "Kecamatan",
  sub_district: "Kelurahan",
  rw: "RW",
  rt: "RT",
  postal_code: "Kode pos",
  notes: "Patokan alamat",
  actual_address: "Alamat lengkap",
  voucher_code: "Kode voucher",
};

export function scrollToFirstError(errObj: Record<string, string>) {
  // Hanya ambil key yang ada di ERROR_ORDER dan MEMANG memiliki pesan error (tidak kosong)
  const orderedKeys = ERROR_ORDER.filter((k) => !!errObj[k as string]);
  const firstKey = orderedKeys[0] as string | undefined;
  if (!firstKey) return;

  // Cari elemen berdasarkan wrapper dulu (agar dropdown react-select kena scroll),
  // baru cari berdasarkan name / id sebagai fallback.
  const el =
    document.getElementById(`scroll-target-${firstKey}`) ||
    document.querySelector(`[name="${firstKey}"]`) ||
    document.getElementById(firstKey);

  const element = el as HTMLElement | null;

  if (element) {
    console.log(
      "Scrolling to:",
      firstKey,
      "Found as wrapper:",
      !!document.getElementById(`scroll-target-${firstKey}`),
    );
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

    // Focus kalau itu input asli (bukan wrapper)
    if (typeof (element as any).focus === "function") {
      (element as any).focus();
    }
  }
}

export function buildErrorToast(errObj: Record<string, string>) {
  const keys = ERROR_ORDER.filter((k) => !!errObj[k as string]);
  if (!keys.length) return "Lengkapi data Anda terlebih dahulu";

  const items = keys.map((k) => ERROR_LABEL[k] ?? String(k));
  const top3 = items.slice(0, 3).join(", ");
  const more = items.length > 3 ? ` (+${items.length - 3} lainnya)` : "";

  return `Periksa: ${top3}${more}`;
}
