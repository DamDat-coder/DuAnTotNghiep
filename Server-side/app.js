require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const multer = require("multer");
// This change is used to allow PR reset main
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const couponsRouter = require("./routes/coupons");
const ordersRouter = require("./routes/order");

const app = express();

// Cấu hình CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3300",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware cơ bản
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(helmet());
app.use(logger("dev"));

// Middleware điều kiện cho express.json()
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  console.log("Content-Type:", contentType); // Log để debug
  if (contentType.startsWith("multipart/form-data")) {
    return next(); // Bỏ qua express.json() cho FormData
  }
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/coupons", couponsRouter);
app.use("/order", ordersRouter);

// Xử lý lỗi
app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found", status: 404 });
});

app.use((err, req, res, next) => {
  console.error("Error details:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}`, status: 400 });
  }
  if (err.message === "Bạn chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)") {
    return res.status(400).json({ message: err.message, status: 400 });
  }
  if (err instanceof SyntaxError && err.message.includes("Unexpected token")) {
    return res.status(400).json({ message: "Invalid request body format", status: 400 });
  }
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;