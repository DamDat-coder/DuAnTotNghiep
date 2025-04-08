const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: Infinity, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

couponSchema.pre('save', function(next) {
    if (this.startDate > this.endDate) {
        return next(new Error('startDate must be before endDate'));
    }
    if (this.usedCount > this.usageLimit) {
        this.status = 'inactive';
    }
    next();
});

module.exports = mongoose.model('Coupon', couponSchema);