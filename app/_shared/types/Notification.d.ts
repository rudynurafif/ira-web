export interface NotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    id: string;
    title: string;
    body: string;
    type: string;
    customerId: string;
    reminderType?: string;
  };
  token: string;
}

export interface NotificationItem {
  id: number;
  is_read: boolean;
  status: null | string;
  read_at: null | string;
  type: string;
  category: string;
  payload: NotificationPayload[]; // pastikan ini array of object, bukan string
  for_source_table: string;
  for_source_id: string;
  to_source_table: string;
  to_source_id: string;
  created_at: string;
}
