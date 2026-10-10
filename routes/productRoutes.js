const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restockProduct,
    sellProduct,
    getLowStockProducts,
    getCategorySummary
} = require("../controllers/productController");

const validateProduct = require("../middleware/validateProduct");


router.get("/low-stock", getLowStockProducts);
router.get("/summary/category", getCategorySummary);


router.post("/", validateProduct, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


router.patch("/:id/restock", restockProduct);
router.patch("/:id/sale", sellProduct);

module.exports = router;