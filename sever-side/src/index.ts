import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';

(async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
<<<<<<< HEAD
      console.log(`🌐 Public API via Nginx: http://api.styleforyou.online (-> /api/*)`);
=======
      console.log(`🌐 Public API via Nginx: https://api.styleforyou.online (-> /api/*)`);
>>>>>>> 26c33e0f889b1f3595e0a2ba18d8d7b249b66ca8
    });
  } catch (err) {
    console.error('❌ Kết nối MongoDB thất bại:', err);
    process.exit(1);
  }
})();
