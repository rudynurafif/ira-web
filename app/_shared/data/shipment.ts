interface ShipmentInfo {
  id: string;
  no_shipment: string;
  status: "assigned" | "pending" | "delivered" | "cancelled" | string; // Sesuaikan dengan status yang valid
  estimation_date: string; // Format: YYYY-MM-DD
  type: "activation" | "delivery" | "maintenance" | string; // Sesuaikan dengan tipe shipment
  assign_by_id: string;
  assign_platform: "mitra" | "internal" | string; // Tambahkan opsi lain jika ada
  cancel_by_id: string | null;
  cancel_platform: string | null;
  notes: string | null;
}

interface CustomerInfo {
  id: string;
  customer_code: string;
  name: string;
  notes: string;
  phone_number: string;
  email: string;
  address: string;
  postal_code: string;
  nik: string | null;
  status: "waiting-for-installation" | "active" | "inactive" | string; // Tambahkan status lain jika ada
  is_active: boolean;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: number;
  longitude: number;
  frame_pool_name: string | null;
  rt: string;
  rw: string;
  token_expired_until: string | null; // ISO date string
  reset_count_cell_max: number | null;
  reset_count_cell: number | null;
  no_kk: string | null;
  register_source: "sales" | "website" | "referral" | string; // Tambahkan opsi lain jika ada
}

export interface Shipment {
  id: string;
  shipment_id: ShipmentInfo;
  customer_id: CustomerInfo;
  code: string;
  code_url: string;
}
