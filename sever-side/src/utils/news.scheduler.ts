import cron from "node-cron";
import newsModel from "../models/news.model";
import NotificationModel from "../models/notification.model";
import UserModel from "../models/user.model";

export const scheduleNewsPublishing = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const scheduledNews = await newsModel.find({
        is_published: false,
        published_at: { $ne: null, $lte: now }
      });

      for (const news of scheduledNews) {
        news.is_published = true;
        await news.save();

        const users = await UserModel.find({}).select("_id").lean();
        const notifications = users.map((user: { _id: string }) => ({
          userId: user._id,
          title: "Tin tức mới từ Shop4Real!",
          message: `Tin tức "${news.title}" đã được đăng, xem ngay nhé!`,
          type: "news",
          isRead: false,
          link: `/posts/${news._id}`,
        }));

        await NotificationModel.insertMany(notifications);

        console.log(`Tự động đăng bài: ${news.title}`);
      }

    } catch (err) {
      console.error("Lỗi khi đăng bài tự động:", err);
    }
  });
};
