const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management API is running"
    });
});

// Product routes
app.use("/api/products", productRoutes);


app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});