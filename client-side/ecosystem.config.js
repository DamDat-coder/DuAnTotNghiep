module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npx",
      args: "next start -p 3300",
      cwd: "C:/DuAnTotNghiep/client-side",
      env: {
        NODE_ENV: "production",
      },
      interpreter: "cmd.exe",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
