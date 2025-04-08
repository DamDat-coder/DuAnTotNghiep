const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    description: { 
        type: String, 
        trim: true 
    },
    img: { 
        type: String, 
        trim: true 
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'categories', 
        default: null 
    }, 
}, { 
    timestamps: true 
});

const categories = mongoose.model('categories', categorySchema);
module.exports = categories;