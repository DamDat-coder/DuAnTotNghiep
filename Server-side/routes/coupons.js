const express = require('express');
const router = express.Router();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const couponController = require('../controllers/couponController');
const { verifyToken, verifyAdmin } = require('../controllers/userController');

router.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', verifyToken, verifyAdmin, couponController.createCoupon);
router.put('/:id', verifyToken, verifyAdmin, couponController.updateCoupon);
router.delete('/:id', verifyToken, verifyAdmin, couponController.deleteCoupon);

module.exports = router;