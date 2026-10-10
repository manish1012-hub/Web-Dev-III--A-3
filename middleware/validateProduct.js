const validateProduct = (req, res, next) => {
    const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

    const errors = [];

    if (!name || name.trim() === "") {
        errors.push("Name is required");
    }

    if (!sku || sku.trim() === "") {
        errors.push("SKU is required");
    }

    if (!category || category.trim() === "") {
        errors.push("Category is required");
    }

    if (price === undefined || price === null || price < 0) {
        errors.push("Price must be 0 or greater");
    }

    if (
        quantity === undefined ||
        quantity === null ||
        quantity < 0 ||
        !Number.isInteger(quantity)
    ) {
        errors.push("Quantity must be a non-negative integer");
    }

    if (
        reorderLevel === undefined ||
        reorderLevel === null ||
        reorderLevel < 0 ||
        !Number.isInteger(reorderLevel)
    ) {
        errors.push("Reorder level must be a non-negative integer");
    }

    if (!supplier || supplier.trim() === "") {
        errors.push("Supplier is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    next();
};

module.exports = validateProduct;