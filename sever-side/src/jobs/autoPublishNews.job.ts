import newsModel from "../models/news.model";

export const autoPublishNews = async () => {
  const now = new Date();
  const newsToPublish = await newsModel.find({
    is_published: false,
    published_at: { $lte: now, $ne: null },
  });

  for (const news of newsToPublish) {
    news.is_published = true;
    await news.save();
  }
};