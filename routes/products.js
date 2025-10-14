const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products");

// Show all products
router.get("/", getAllProducts);

// Add product form
router.get("/edit", (req, res) => {
  res.render("product", { product: null });
});

// Edit product form
router.get("/edit/:id", getProduct);

// Create product
router.post("/", createProduct);

// Update product
router.post("/update/:id", updateProduct);

// Delete product
router.post("/delete/:id", deleteProduct);

module.exports = router;
