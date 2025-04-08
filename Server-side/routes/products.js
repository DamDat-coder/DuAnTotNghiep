const express = require("express");
const router = express.Router();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { getAllProducts, getProductById, addPro, editPro, deletePro } = require("../controllers/productController");
const { verifyToken, verifyAdmin } = require("../controllers/userController");

router.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
router.use(limiter);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, verifyAdmin, addPro);
router.patch("/:id", verifyToken, verifyAdmin, editPro);
router.delete("/:id", verifyToken, verifyAdmin, deletePro);

module.exports = router;