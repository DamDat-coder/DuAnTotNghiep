module.exports = {
  apps: [
    {
      name: "backend",
      // ⚠️ SỬA path cho đúng VPS (ví dụ):
      // cwd: "/var/www/DA3/server-side",
      cwd: "C:/DuAnTotNghiep/sever-side",

      script: "dist/index.js", // build xong mới có dist/
      // Hoặc: script: "npm", args: "run start:prod"

      // ENV mặc định (dev)
      env: {
        NODE_ENV: "development",
        PORT: "3000",
        HOST: "127.0.0.1",
      },

      // ENV khi chạy production
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1",

        CLIENT_URL: "http://styleforyou.online",

        CORS_ORIGINS: "http://styleforyou.online,https://styleforyou.online,http://www.styleforyou.online,https://www.styleforyou.online,http://103.106.104.87:3300",

        VNPAY_RETURN_URL: "http://api.styleforyou.online/payment/vnpay-return",

        ZALOPAY_CALLBACK_URL: "http://api.styleforyou.online/payment/zalopay-callback",
        ZALOPAY_RETURN_URL: "http://api.styleforyou.online/payment/zalopay-return",

        MOMO_NOTIFY_URL: "http://api.styleforyou.online/payment/momo-callback",
        MOMO_RETURN_URL: "http://api.styleforyou.online/payment/momo-return",
      },

      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
