const categories = require("../models/categoryModel");
const mongoose = require("mongoose");

const getAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const parentId = req.query.parentId || null;

        const query = parentId ? { parentId } : { parentId: null };
        const arr = await categories.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('parentId', 'name')
            .lean(); // Tăng hiệu suất
        const total = await categories.countDocuments(query);

        res.status(200).json({
            status: "success",
            data: arr,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Lấy chi tiết danh mục theo ID
const getCategoryById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ status: "error", message: "ID không hợp lệ" });
        }
        const category = await categories.findById(req.params.id)
            .populate('parentId', 'name')
            .lean();
        if (!category) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy danh mục" });
        }
        res.status(200).json({ status: "success", data: category });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Tạo danh mục mới
const createCategory = async (req, res) => {
    try {
        const { name, description, img, parentId } = req.body;
        if (!name || name.length > 100) {
            return res.status(400).json({ 
                status: "error", 
                message: "Tên danh mục là bắt buộc và tối đa 100 ký tự" 
            });
        }
        if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({ status: "error", message: "parentId không hợp lệ" });
        }
        if (parentId) {
            const parentExists = await categories.findById(parentId).lean();
            if (!parentExists) {
                return res.status(404).json({ status: "error", message: "Danh mục cha không tồn tại" });
            }
        }

        const newCategory = new categories({ name, description, img, parentId: parentId || null });
        const savedCategory = await newCategory.save();
        res.status(201).json({
            status: "success",
            message: "Tạo danh mục thành công",
            data: savedCategory
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", message: "Tên danh mục đã tồn tại" });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: "error", message: "ID không hợp lệ" });
        }

        const { name, description, img, parentId } = req.body;
        if (name && name.length > 100) {
            return res.status(400).json({ 
                status: "error", 
                message: "Tên danh mục tối đa 100 ký tự" 
            });
        }
        if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({ status: "error", message: "parentId không hợp lệ" });
        }
        if (parentId) {
            const parentExists = await categories.findById(parentId).lean();
            if (!parentExists) {
                return res.status(404).json({ status: "error", message: "Danh mục cha không tồn tại" });
            }
            if (parentId === id) {
                return res.status(400).json({ status: "error", message: "Danh mục không thể là cha của chính nó" });
            }
            // Kiểm tra vòng lặp (cycle detection)
            const hasCycle = await checkCycle(id, parentId);
            if (hasCycle) {
                return res.status(400).json({ status: "error", message: "Phát hiện vòng lặp trong phân cấp" });
            }
        }

        const updatedCategory = await categories.findByIdAndUpdate(
            id,
            { name, description, img, parentId: parentId || null, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy danh mục" });
        }
        res.status(200).json({
            status: "success",
            message: "Cập nhật danh mục thành công",
            data: updatedCategory
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", message: "Tên danh mục đã tồn tại" });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: "error", message: "ID không hợp lệ" });
        }

        const hasChildren = await categories.findOne({ parentId: id }).lean();
        if (hasChildren) {
            return res.status(400).json({ status: "error", message: "Không thể xóa danh mục có danh mục con" });
        }

        const deletedCategory = await categories.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy danh mục" });
        }
        res.status(200).json({ status: "success", message: "Xóa danh mục thành công" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Hàm kiểm tra vòng lặp trong phân cấp
const checkCycle = async (categoryId, parentId) => {
    let currentId = parentId;
    while (currentId) {
        if (currentId.toString() === categoryId) return true; // Phát hiện vòng lặp
        const category = await categories.findById(currentId).lean();
        currentId = category?.parentId;
    }
    return false;
};

module.exports = { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
};