export interface PaymentChannel {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive"; // bisa dibatasi jika nilai terbatas
  category: "va" | "qris" | "ewallet" | "otc" | "card"; // sesuaikan dengan kategori yang ada
  fee_type: "none" | "flat" | "percent" | "flat_percent"; // contoh, sesuaikan dengan backend
  fee_flat: string; // dalam string karena dari API umumnya string (bisa jadi angka desimal)
  fee_percent: string;
  success_return_url: string;
  failure_return_url: string;
  payload_payment: string;
  is_active: boolean;
  logo: string;
}

export interface PaymentRequestApiResponse {
  statusCode: number;
  data: PaymentData;
}

export interface VAPaymentData {
  id: string;
  customer_id: Customer;
  channel_payment_id: ChannelPayment;
  package_id: PackageDetail;
  va: string;
  xendit_id: string;
  expire_at: string;
  amount: string;
}

export interface QRISPaymentData {
  id: string;
  customer_id: Customer;
  channel_payment_id: ChannelPayment;
  package_id: PackageDetail;
  va: string;
  xendit_id: string;
  expire_at: string;
  amount: string;
}

export interface EWalletPaymentData {
  id: string;
  customer_id: Customer;
  package_id: PackageDetail;
  gateway: string;
  method_category: string;
  channel_code: string;
  amount: string;
  currency: string;
  payment_number: string | null;
  status: string;
  failure_code: string | null;
  failure_message: string | null;
  xendit_event_id: string;
  expires_at: string | null;
  desktop_web_checkout_url: string | null;
  mobile_web_checkout_url: string | null;
  mobile_deeplink_checkout_url: string | null;
  qr_checkout_string: string | null;
  raw_payload: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  notes: string | null;
  phone_number: string;
  email: string;
  address: string;
  postal_code: string | null;
  nik: string;
  status: "active" | "inactive" | string; // jaga-jaga kalau ada status lain
  is_active: boolean;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  frame_pool_name: string | null;
  rt: string | null;
  rw: string | null;
  token_expired_until: string | null; // ISO date string | null
  reset_count_cell_max: number | null;
  reset_count_cell: number | null;
  no_kk: string | null;
  register_source: string; // e.g. "web"
}

export type PaymentCategory =
  | "va"
  | "ewallet"
  | "qris"
  | "otc"
  | "card"
  | string;

export interface ChannelPayment {
  id: string;
  code: string; // e.g. "BCA"
  name: string; // e.g. "BCA Virtual Account"
  status: "active" | "inactive" | string;
  category: PaymentCategory; // e.g. "va"
  fee_type: "flat" | "percent" | string;
  fee_flat: string; // "9000" (string dari API)
  fee_percent: string; // "0.000"
  success_return_url: string;
  failure_return_url: string;
  payload_payment: string; // JSON string
  is_active: boolean;
}

export interface PackageDetail {
  id: string;
  name: string;
  speed_mbps: string; // "50"
  quota_mb: string; // "102400"
  discount_price: string; // "75000"
  price: number; // 300000
  treshold_isolate_days: number; // 3
  description: string;
  remarks: string | null;
  is_active: boolean;
  duration: number; // 30
}

export interface PackageDetail {
  id: string;
  name: string;
  speed_mbps: string;
  quota_mb: string;
  discount_price: string;
  price: number;
  treshold_isolate_days: number;
  description: string;
  remarks: string;
  is_active: boolean;
  duration: number;
}
