const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors');
const { logoff } = require('./sessionController');

const getAllOrders = async (req, res) => {
    const orders = await Order.find({ user_id: req.user._id })
        .populate('items.product_id', 'name price')
        .sort("createdAt");
    const products = await Product.find({}).sort('createdAt');

    res.render('orders', { orders, products, csrfToken: req.csrfToken() });
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
    const { id: orderId } = req.params;
    const { product_id, quantity } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const item = order.items.find(
      (i) => i.product_id.toString() === product_id || i.product_id._id?.toString() === product_id
    );

    if (!item) {
      throw new NotFoundError("Product not found in order");
    }
    item.quantity = quantity;

    const product = await Product.findById(product_id);
    order.price = product.price * quantity;

    await order.save();
    res.status(200).json({ msg: "Order updated successfully" });
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