module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "C:/DuAnTotNghiep/server-side",
      script: "dist/index.js",            // chạy file khởi động server
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1"
      },
      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
