import { PackageDetail } from "./payment";

export type Customer = {
  id: string;
  customer_code: string;
  name: string;
  notes: string | null;
  phone_number: string;
  email: string;
  address: string;
  postal_code: string | null;
  nik: string;
  status: string;
  is_active: boolean;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: number;
  longitude: number;
  frame_pool_name: string | null;
  rt: string | null;
  rw: string | null;
  token_expired_until: string | null;
  reset_count_cell_max: string | null;
  reset_count_cell: number | null;
  no_kk: string;
  register_source: string;
};

export type Bts = {
  id: string;
  name: string;
  code: string;
  address: string;
  rt: string;
  rw: string;
  postal_code: string;
  capacity: number;
  latitude: number;
  longitude: number;
  customer_id: Customer[];
};

export type BtsPackageId = {
  id: string;
  bts_id: Bts;
};

export type PackageData = {
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
  bts_package_id: BtsPackageId[];
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
  status:
    | "canceled-instalation"
    | "waiting-for-installation"
    | "active"
    | "suspend"
    | "dismantled"
    | "inactive";
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
  province_id: {
    id: string;
    name: string;
  };
  city_id: {
    id: string;
    name: string;
  };
  district_id: {
    id: string;
    name: string;
  };
  sub_district_id: {
    id: string;
    name: string;
  };
};
