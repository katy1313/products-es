const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')

const getAllProducts = async (req, res) => {
    const products = await Product.find({ createdBy: req.user._id }).sort("createdAt");
    req.body.createdBy = req.user._id

    res.render("products", { products });
  };

const getProduct = async(req, res) => {
    const {
        user:{userId},
        params:{id:productId},
    } = req

    const product = await Product.findOne({
        _id: productId,
        createdBy: req.user._id,
    })

    if(!product) {
        throw new Error('No product has been found')
    }
    res.render("product", { product });
}

const createProduct = async(req, res) => {
    req.body.createdBy = req.user._id
    await Product.create(req.body)
    res.redirect('/products')
}

const updateProduct = async(req, res) => {
    const {
        user:{_id},
        params:{id:productId},
        body: {name},
    } = req

    if(name === ''){
        throw new BadRequestError('Name cannot be empty')
    }

    const product = await Product.findByIdAndUpdate({
        _id: productId,
        createdBy: req.user._id,
    }, req.body,
    {new:true, runValidators:true})

    if(!product) {
        throw new NotFoundError('No product has been found')
    }
    res.redirect('/products')
}

const deleteProduct = async(req, res) => {
    const {
        // user:{userId},
        params:{id:productId},
    } = req

    const product = await Product.findByIdAndDelete({
        _id:productId,
        createdBy: req.user._id,
    })
    if(!product) {
        throw new NotFoundError('No product has been found')
    }
    res.redirect('/products')
}

module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}