import { NotificationResponse } from "@/types/notification";
import { API_BASE_URL, fetchWithAuth } from "./api";

export async function fetchNotifications(): Promise<NotificationResponse> {
  try {
    const response = await fetchWithAuth<NotificationResponse>(
      `${API_BASE_URL}/notifications/me`,
      {
        cache: "no-store",
      }
    );
    if (!response.success) {
      throw new Error(response.message || "Lỗi khi lấy thông báo");
    }
    console.log(response);
    
    return response;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    throw new Error(error.message || "Không thể tải thông báo");
  }
}

export async function markAllNotificationsAsRead(
  notificationIds: string[]
): Promise<void> {
  try {
    await Promise.all(
      notificationIds.map((id) =>
        fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
          method: "PATCH",
        })
      )
    );
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    throw new Error(error.message || "Lỗi khi đánh dấu đã đọc");
  }
}
