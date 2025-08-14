module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "C:/DuAnTotNghiep/sever-side",
      script: "dist/index.js",

      // ENV khi develop local nếu cần
      env: {
        NODE_ENV: "development",
        PORT: "3000",
        HOST: "127.0.0.1",
      },

      // ENV production trên VPS
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1",

        CLIENT_URL: "https://styleforyou.online",

        // Chỉ để đúng 2 origin FE, không lặp, không IP
        CORS_ORIGINS: "https://styleforyou.online,https://www.styleforyou.online",

        VNPAY_RETURN_URL: "https://api.styleforyou.online/payment/vnpay-return",

        ZALOPAY_CALLBACK_URL: "https://api.styleforyou.online/payment/zalopay-callback",
        ZALOPAY_RETURN_URL: "https://api.styleforyou.online/payment/zalopay-return",

        MOMO_NOTIFY_URL: "https://api.styleforyou.online/payment/momo-callback",
        MOMO_RETURN_URL: "https://api.styleforyou.online/payment/momo-return",
      },

      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
