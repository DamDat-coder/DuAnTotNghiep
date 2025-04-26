require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const limiter = require("./config/rateLimit");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const couponsRouter = require("./routes/coupons");
const ordersRouter = require("./routes/order");
const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(helmet());
app.use(logger("dev"));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3300",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/coupons", couponsRouter);
app.use("/order", ordersRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (app.get("env") === "development") {
    console.error(err.stack);
  }
  res.status(status).json({
    error: {
      message,
      status,
    },
  });
});

module.exports = app;
