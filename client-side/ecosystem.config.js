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
<<<<<<< HEAD
        NEXT_PUBLIC_API_URL: "http://api.styleforyou.online",
=======
        // nhớ dùng HTTPS
        NEXT_PUBLIC_API_URL: "https://api.styleforyou.online",
>>>>>>> 26c33e0f889b1f3595e0a2ba18d8d7b249b66ca8
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
