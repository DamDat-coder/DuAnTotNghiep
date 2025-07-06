export interface INotification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  icon?: string;
}