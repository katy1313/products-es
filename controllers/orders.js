const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllOrders = async (req, res) => {
    const orders = await Order.find({ user_id: req.user._id })
        .populate('items.product_id', 'name price')
        .sort("createdAt");

    res.render('orders', { orders, products: [], csrfToken: req.csrfToken() });
};

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).sort('createdAt');
    res.render('products', { products });
};

const getOrder = async (req, res) => {
    const { id } = req.params;

    const order = await Order.findOne({
        _id: id,
        user_id: req.user._id,
    }).populate('items.product_id', 'name price');

    if (!order) {
        throw new NotFoundError('No order has been found');
    }

    res.render('order', { order });
};

const createOrder = async (req, res) => {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
        throw new BadRequestError('Please provide product ID and quantity');
    }

    const product = await Product.findById(product_id);
    if (!product) throw new NotFoundError('Product not found');

    const price = product.price * quantity;

    const order = await Order.create({
        user_id: req.user._id,
        items: [{ product_id, quantity }],
        price,
    });

    res.redirect('/orders');
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const order = await Order.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        { 'items.0.quantity': quantity },
        { new: true, runValidators: true }
    );

    if (!order) throw new NotFoundError('No order has been found');
    res.redirect('/orders');
};

const deleteOrder = async (req, res) => {
    const { id } = req.params;

    const order = await Order.findOneAndDelete({
        _id: id,
        user_id: req.user._id,
    });

    if (!order) throw new NotFoundError('No order has been found');
    res.redirect('/orders');
};

module.exports = {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getAllProducts
}