import { PackageData } from "./customer-area";

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

export interface PaymentAttempt {
  id: string;
  gateway: string;
  method_category: string;
  channel_code: string;
  amount: string;
  currency: string;
  payment_number: string;
  desktop_web_checkout_url: string | null;
  mobile_web_checkout_url: string | null;
  mobile_deeplink_checkout_url: string | null;
  qr_checkout_string: string | null;
  status: string;
  failure_code: string | null;
  failure_message: string | null;
  xendit_event_id: string;
  reference_id: string | null;
  expires_at: string;
  raw_payload: string | null;
}

export interface UnifiedPaymentData {
  id: string;
  customer_id: Customer;
  package_id: PackageDetail;
  gateway: string;
  method_category: "va" | "e_wallet" | "qris" | "otc";
  channel_code: string;
  amount: string | number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired";
  expires_at?: string | null;
  xendit_event_id?: string | null;
  reference_id?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  raw_payload?: any;

  va?: string;
  channel_payment_id?: ChannelPayment;

  desktop_web_checkout_url?: string | null;
  mobile_web_checkout_url?: string | null;
  mobile_deeplink_checkout_url?: string | null;
  qr_checkout_string?: string | null;

  payment_number?: string | null;
  payment_attempt: PaymentAttempt;
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
  logo: string;
  description: string;
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

export interface BillingItem {
  id: string;
  billing_period: string;
  billing_year: number;
  amount: string;
  tax: string;
  discount_price: string;
  discount_rate: string;
  total_due: string;
  voucher_code: string | null;
  is_free: boolean;
  status: string;
  billing_issued_at: string;
  billing_start_at: string;
  billing_deadline_at: string;
  remarks: string | null;
  description: string | null;
  invoice_id: InvoiceID[];
}

export interface InvoiceID {
  id: string;
  invoice_no: string;
  status: string; // Misal: "paid", "pending", "failed"
  currency: string; // Misal: "IDR"
  amount: string; // "300000.00"
  tax: string; // "0.00"
  discount_price: string; // "0.00"
  discount_rate: string; // "0.00"
  total_due: string; // "300000.00"
  is_free: boolean;
  issued_at: string; // ISO 8601 datetime
  due_at: string; // ISO 8601 datetime
  paid_at: string | null; // ISO 8601 datetime atau null jika belum dibayar
  payment_gateway: string; // "xendit"
  payment_method: string; // "e_wallet", "va", "qris", dll.
  payment_number: string | null;
  payment_reference: string | null; // ID referensi dari gateway
  paid_amount: string | null; // "300000.00"
  gateway_pr_id: string | null; // Payment Request ID di gateway
  gateway_pm_id: string | null; // Payment Method ID di gateway
  checkout_url: string | null;
  qr_string: string | null;
  xendit_event_id: string | null;
  callback_received_at: string | null; // Saat callback diterima
  failure_code: string | null;
  failure_message: string | null;
  remarks: string | null;
  description: string | null;
}

// Subscription history entry
export interface SubscriptionHistoryAPI {
  id: string;
  customer_id: Customer;
  package_id: PackageData;
  start_date: string; // format: "YYYY-MM-DD"
  end_date: string; // format: "YYYY-MM-DD"
  billing_id: BillingItem[]; // array of billing records
  shipment_status: string;
}
