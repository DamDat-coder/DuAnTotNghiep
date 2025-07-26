import cron from "node-cron";
import { autoPublishNews } from "./autoPublishNews.job";


const schedule = "* * * * *";

cron.schedule(schedule, async () => {
  await autoPublishNews();
  console.log("Đã kiểm tra và tự động đăng tin tức theo lịch.");
});

