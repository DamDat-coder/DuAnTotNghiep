import { Request, Response } from 'express';
import Coupon, { ICoupon } from '../models/couponsModel';
import { validateCouponFields } from '../utils/validateCouponFields';

// Lấy tất cả coupons (có pagination)
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '10', status } = req.query;
        const query = status ? { status } : {};
        const coupons = await Coupon.find(query)
            .limit(parseInt(limit as string))
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .sort({ createdAt: -1 });
        const total = await Coupon.countDocuments(query);
        
        res.json({
            coupons,
            totalPages: Math.ceil(total / parseInt(limit as string)),
            currentPage: parseInt(page as string)
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Tạo mới coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            code, description, discountType, discountValue, minOrderAmount,
            maxDiscountAmount, startDate, endDate, usageLimit
        }: Partial<ICoupon> = req.body;

        // Validation cơ bản
        const validationError = validateCouponFields({ code, discountType, discountValue, startDate, endDate });
        if (validationError) {
            res.status(400).json({ message: validationError });
            return;
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
        res.status(400).json({ message: (error as Error).message });
    }
};

// Lấy coupon theo ID
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Cập nhật coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }

        // Cập nhật các trường nếu có trong request body
        const fields: (keyof ICoupon)[] = [
            'code', 'description', 'discountType', 'discountValue',
            'minOrderAmount', 'maxDiscountAmount', 'startDate', 'endDate',
            'usageLimit', 'status'
        ];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                (coupon[field] as any) = req.body[field];
            }
        });

        // Kiểm tra logic nghiệp vụ
        if (coupon.usedCount && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            coupon.status = 'inactive';
        }
        if (new Date(coupon.endDate) < new Date()) {
            coupon.status = 'inactive';
        }

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

// Xóa coupon (soft delete)
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }

        // Soft delete: chỉ cập nhật status
        coupon.status = 'inactive';
        await coupon.save();
        res.json({ message: 'Coupon deactivated' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};