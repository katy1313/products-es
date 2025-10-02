const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')

const getAllProducts = async(req, res) => {
    const products = await Product.find({createdBy:req.user.userId}).sort('createdAt')
    res.status(StatusCodes.OK).json({products, count: products.length})
}
const getProduct = async(req, res) => {
    const {user:{userId}, params:{id:productId}} = req
    const product = await Product.findOne({
        _id: productId,
        createdBy: userId,
    })
    if(!product) {
        throw new Error('No product has been found')
    }
    res.status(StatusCodes.OK).json({product})
}

const createProduct = async(req, res) => {
    req.body.createdBy = req.user.userId
    const job = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json(job)
}
const updateProduct = async(req, res) => {
    const {
        user:{userId},
        params:{id:productId},
        body: {name},
    } = req
    if(name === ''){
        throw new BadRequestError('Name cannot be empty')
    }

    const product = await Product.findByIdAndUpdate({
        _id: productId,
        createdBy: userId,
    }, req.body, {new:true, runValidators:true})

    if(!product) {
        throw new NotFoundError('No product has been found')
    }
    res.status(StatusCodes.OK).json({product})
}


const deleteProduct = async(req, res) => {
    const {
        user:{userId},
        params:{id:productId},
    } = req

    const product = await Product.findByIdAndRemove({
        _id:productId,
        createdBy:userId,
    })
    if(!product) {
        throw new NotFoundError('No product has been found')
    }
    res.status(StatusCodes.OK).json({msg: "The entry was deleted"})
}

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
// GET /jobs/new (Put up the form to create a new entry)
// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
// POST /jobs/update/:id (Update a particular entry)
// POST /jobs/delete/:id (Delete an entry)


module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}