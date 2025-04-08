const Coupon = require('../models/couponsModel');

// Middleware để kiểm tra quyền admin (giả định)
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) { // Giả định req.user từ JWT
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Lấy tất cả coupons (có pagination)
exports.getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};
        const coupons = await Coupon.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
        const total = await Coupon.countDocuments(query);
        
        res.json({
            coupons,
            totalPages: Math.ceil(total / limit),
            currentPage: page * 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới coupon
exports.createCoupon = async (req, res) => {
    try {
        const {
            code, description, discountType, discountValue, minOrderAmount,
            maxDiscountAmount, startDate, endDate, usageLimit
        } = req.body;

        // Validation cơ bản
        if (!code || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const coupon = new Coupon({
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            startDate,
            endDate,
            usageLimit,
            status: 'active'
        });

        const newCoupon = await coupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy coupon theo ID
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật coupon
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Cập nhật các trường nếu có trong request body
        const fields = [
            'code', 'description', 'discountType', 'discountValue',
            'minOrderAmount', 'maxDiscountAmount', 'startDate', 'endDate',
            'usageLimit', 'status'
        ];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                coupon[field] = req.body[field];
            }
        });

        // Kiểm tra logic nghiệp vụ
        if (coupon.usedCount >= coupon.usageLimit) {
            coupon.status = 'inactive';
        }
        if (new Date(coupon.endDate) < new Date()) {
            coupon.status = 'inactive';
        }

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa coupon (soft delete)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Soft delete: chỉ cập nhật status
        coupon.status = 'inactive';
        await coupon.save();
        res.json({ message: 'Coupon deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};