const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must contain at least 2 characters"]
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
            uppercase: true
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be an integer"
            }
        },

        reorderLevel: {
            type: Number,
            required: [true, "Reorder level is required"],
            min: [0, "Reorder level cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Reorder level must be an integer"
            }
        },

        supplier: {
            type: String,
            required: [true, "Supplier is required"],
            trim: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


productSchema.virtual("stockValue").get(function () {
    return this.price * this.quantity;
});

module.exports = mongoose.model("Product", productSchema);