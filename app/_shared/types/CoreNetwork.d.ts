export interface CpeSimBinding {
  id?: string;
  cpe_id: Cpe;
  sim_id?: SimCard;
  binding_date?: string; // ISO date string
  binding_by?: "manufacture" | "system" | "admin" | string;
  customer_id?: Customer;
}

export interface CPEBrand {
  id: string;
  name: string;
  model: string;
}

export interface Cpe {
  id?: string;
  name?: string;
  cpe_brand_model_id?: CPEBrand;
  serial_number?: string;
  mac_address?: string;
  imei?: string;
  ssid: string;
  ssid5: string;
  password: string;
  password5: string;
  status?: "ok" | "inactive" | "error" | string;
}

export interface SimCard {
  id: string;
  imsi: string;
  iccid: string;
  msisdn: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  notes: string;
  phone_number: string;
  email: string | null;
  address: string;
  postal_code: string;
  nik: string | null;
  status: "active" | "inactive" | string;
  is_active: boolean;
  email_verified: boolean;
  phone_number_verified: boolean;
  latitude: number;
  longitude: number;
  frame_pool_name: string | null;
  rt: string;
  rw: string;
  token_expired_until: string | null;
  reset_count_cell_max: number | null;
  reset_count_cell: number | null;
  no_kk: string | null;
  register_source: "app" | "web" | "admin" | string;
}

type SSIDPayload = {
  ssid: string;
  ssid5: string;
  password: string;
  password5: string;
};

export type SSEPayload = {
  type: string;
  sn?: string;
  taskId?: string;
  result?: string;
  message?: string;
  data?: SSIDPayload | any;
  customer_code?: string;
};

export type SetSSIDBody = {
  sn: string;
  ssid?: string;
  password?: string;
  ssid5?: string;
  password5?: string;
};
