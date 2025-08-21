import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../env");
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Kết nối MongoDB thất bại:", err);
    process.exit(1);
  });
