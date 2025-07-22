import newsModel from "../models/news.model";

export const autoPublishNews = async () => {
  const now = new Date();
  const newsToPublish = await newsModel.find({
    is_published: false,
    published_at: { $lte: now, $ne: null },
  });

  console.log(`[AutoPublish] Số bài cần đăng: ${newsToPublish.length}`);

  for (const news of newsToPublish) {
    news.is_published = true;
    await news.save();
    console.log(`[AutoPublish] Đã đăng bài: ${news.title} (${news._id})`);
    // TODO: Gửi thông báo cho người dùng nếu cần
  }
};