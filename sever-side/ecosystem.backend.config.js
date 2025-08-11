module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "C:/DuAnTotNghiep/server-side",
      script: "node",
      args: "-r dotenv/config dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1",
        DOTENV_CONFIG_PATH: "C:/DuAnTotNghiep/sever-side/.env"
      },
      autorestart: true,
      max_memory_restart: "600M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
