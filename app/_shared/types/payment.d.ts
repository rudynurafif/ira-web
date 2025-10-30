export interface PaymentChannel {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive"; // bisa dibatasi jika nilai terbatas
  category: "va" | "qris" | "ewallet" | "otc" | "card"; // sesuaikan dengan kategori yang ada
  fee_type: "none" | "flat" | "percent" | "flat_percent"; // contoh, sesuaikan dengan backend
  fee_flat: string; // dalam string karena dari API umumnya string (bisa jadi angka desimal)
  fee_percent: string; // tetap string karena format desimal dari API
  success_return_url: string;
  failure_return_url: string;
  payload_payment: string; // JSON string, mungkin perlu di-parse
  is_active: boolean;
  logo: string
}
