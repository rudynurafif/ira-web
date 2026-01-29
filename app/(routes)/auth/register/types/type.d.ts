export interface FormType {
  package_id: string;
  fullname: string;
  email: string;
  phone: string;
  otp: string;
  // password: string;
  // confirm_password: string;
  nik: string;
  nokk: string;
  province: string;
  city: string;
  district: string;
  sub_district: string;
  rw: string;
  rt: string;
  postal_code: string;
  notes: string;
  actual_address: string;
  voucher_code: string;
  address_gmaps?: any;
  latitude?: string | number;
  longitude?: string | number;
}
