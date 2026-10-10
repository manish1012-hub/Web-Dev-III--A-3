const Product = require("../models/Product");

const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};


const getProducts = async (req, res, next) => {
    try {
        let {
            search,
            category,
            minPrice,
            maxPrice,
            minQuantity,
            maxQuantity,
            sort = "createdAt",
            order = "desc",
            page = 1,
            limit = 10
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const filter = {};


        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } }
            ];
        }

      
        if (category) {
            filter.category = {
                $regex: `^${category}$`,
                $options: "i"
            };
        }

   
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

   
        if (minQuantity !== undefined || maxQuantity !== undefined) {
            filter.quantity = {};

            if (minQuantity !== undefined) {
                filter.quantity.$gte = Number(minQuantity);
            }

            if (maxQuantity !== undefined) {
                filter.quantity.$lte = Number(maxQuantity);
            }
        }

        const allowedSortFields = [
            "name",
            "price",
            "quantity",
            "reorderLevel",
            "createdAt"
        ];

        if (!allowedSortFields.includes(sort)) {
            sort = "createdAt";
        }

        const sortOrder = order === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const products = await Product.find(filter)
            .sort({ [sort]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            count: products.length,
            products
        });

    } catch (error) {
        next(error);
    }
};



const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
};



const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
};


const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted",
            id: product._id
        });

    } catch (error) {
        next(error);
    }
};



const restockProduct = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (
            quantity === undefined ||
            quantity <= 0 ||
            !Number.isInteger(quantity)
        ) {
            return res.status(400).json({
                message: "Restock quantity must be a positive integer"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { quantity: quantity } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product restocked successfully",
            product
        });

    } catch (error) {
        next(error);
    }
};



const sellProduct = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (
            quantity === undefined ||
            quantity <= 0 ||
            !Number.isInteger(quantity)
        ) {
            return res.status(400).json({
                message: "Sale quantity must be a positive integer"
            });
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                quantity: { $gte: quantity }
            },
            {
                $inc: { quantity: -quantity }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            const existingProduct = await Product.findById(req.params.id);

            if (!existingProduct) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        res.status(200).json({
            message: "Sale recorded successfully",
            product
        });

    } catch (error) {
        next(error);
    }
};



const getLowStockProducts = async (req, res, next) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        }).sort({ quantity: 1 });

        res.status(200).json({
            count: lowStockItems.length,
            lowStockItems
        });

    } catch (error) {
        next(error);
    }
};



const getCategorySummary = async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",

                    totalProducts: {
                        $sum: 1
                    },

                    totalQuantity: {
                        $sum: "$quantity"
                    },

                    totalInventoryValue: {
                        $sum: {
                            $multiply: ["$price", "$quantity"]
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalProducts: 1,
                    totalQuantity: 1,
                    totalInventoryValue: 1
                }
            },

            {
                $sort: {
                    category: 1
                }
            }
        ]);

        res.status(200).json({
            count: summary.length,
            categories: summary
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restockProduct,
    sellProduct,
    getLowStockProducts,
    getCategorySummary
};