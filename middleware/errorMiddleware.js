const errorMiddleware = (err, req, res, next) => {
    console.error(err);


    if (err.code === 11000) {
        return res.status(400).json({
            message: "SKU already exists",
            field: err.keyValue
        });
    }


    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }


    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(
            (error) => error.message
        );

        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
};

module.exports = errorMiddleware;