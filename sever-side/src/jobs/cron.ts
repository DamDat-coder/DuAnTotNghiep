import cron from "node-cron";
import { autoPublishNews } from "./autoPublishNews.job";

cron.schedule("*/5 * * * *", async () => {
  await autoPublishNews();
});