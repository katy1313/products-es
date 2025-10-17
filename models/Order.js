const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user ID'],
        },
        items: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Please provide product ID'],
                },
                quantity: {
                    type: Number,
                    required: [true, 'Please provide quantity of the product'],
                    min: 1,
                },
            },
        ],
        price: {
            type: Number,
            min: 0,
        }
    }
)

module.exports = mongoose.model('Order', OrderSchema)