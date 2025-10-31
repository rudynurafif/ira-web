export type ActivePacketData = {
  packageName: string;
  packageDuration: string;
  price: string;
  speed: string;
  expiryDate: string;
  onExtend?: () => void;
};

export type ProfileInfo = {
  id: string;
  customer_code: string;
  name: string;
  notes: string | null;
  phone_number: string;
  email: string | null;
  address: string;
  postal_code: string | null;
  nik: string | null;
  status: string; // contoh: "waiting-for-installation"
  is_active: boolean;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  frame_pool_name: string | null;
  rt: string | null;
  rw: string | null;
  token_expired_until: string | null; // ISO datetime dari backend (jika ada)
  reset_count_cell_max: number | null;
  reset_count_cell: number | null;
  no_kk: string | null;
};

export type SubscriptionHistory = {
  paid: boolean;
  mainTitle: string;
  packageInfo: string;
  subTitle: string;
  price: string;
};
