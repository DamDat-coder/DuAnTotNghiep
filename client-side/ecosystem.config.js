// C:/DuAnTotNghiep/client-side/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "C:/DuAnTotNghiep/client-side",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3300",
      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
