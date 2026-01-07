export type DecodedToken = {
  phone_number: string;
  id: string;
  customer_id: string;
  is_coverage: boolean;
  name: string;
  iat: number;
  exp: number;
};

export interface WifiConfig {
  ssid?: string;
  password?: string;
  ssid5?: string;
  password5?: string;
}

export type SSEContextType = {
  serverTime: string | null;
  chatMessages: string[];
  lastEvent: SSEPayload | null;
  wifiConfig: WifiConfig;
};
