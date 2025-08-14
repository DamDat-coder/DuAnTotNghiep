// C:/DuAnTotNghiep/client-side/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "C:/DuAnTotNghiep/client-side",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3300",
      env: {
        NODE_ENV: "production",
        // nhớ dùng HTTPS
        NEXT_PUBLIC_API_URL: "https://api.styleforyou.online",
        NEXT_PUBLIC_GOOGLE_CLIENT_ID:
          "995974862597-d2ab3adri4496s828b088pj94l4b9ofn.apps.googleusercontent.com",
        NEXT_PUBLIC_DISABLE_FAST_REFRESH: "true",
      },
      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
