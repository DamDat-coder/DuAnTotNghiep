export interface INotification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  icon?: string;
}

export interface Notification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  icon?: string; // Icon tùy chọn cho giao diện
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}
