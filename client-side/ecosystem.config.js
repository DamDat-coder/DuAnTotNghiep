module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "C:/DuAnTotNghiep/client-side",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3300",
      env: {
        NODE_ENV: "production",
      },
      node_args: "--max-old-space-size=4096",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
