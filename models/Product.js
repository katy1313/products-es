const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name of the product'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    category: {
        type: String,
        required: [true, 'Please provide tea category'],
        enum: ['black', 'green', 'herbal'],
        trim: true,
        maxlength: [100, 'Category cannot be more than 100 characters'],
    },
    flavor: {
        type: String,
        required: [true, 'Please provide main flavor'],
        enum: ['jasmine', 'strawberry', 'mixedberries', 'grape', 'tropical'],
        trim: true,
        maxlength: [100, 'Flavor cannot be more than 100 characters'],
    },
    image: {
        type: String,
        required: false,
        trim: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
}, { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)