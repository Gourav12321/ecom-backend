// Load environment variables first
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const UserAuthRoute = require("./routes/UserAuth.routes");
const ProductRoute = require("./routes/Product.routes");
const CategoryRoute = require("./routes/Category.routes");
const OrderRoute = require("./routes/Cart.routes");
const orderRoutes = require("./routes/Orders.route");
const AdminDashboard = require("./routes/AdminDashboard.route");
const wishlist = require("./routes/wishlist.routes");
const cookieParser = require("cookie-parser");

const app = express();

// CORS configuration for production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// MongoDB connection with better error handling
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

// Define API routes
app.use("/api/user", UserAuthRoute);
app.use("/api", ProductRoute);
app.use("/api", CategoryRoute);
app.use("/api/cart", OrderRoute);
app.use("/api/order", orderRoutes);
app.use("/api", AdminDashboard);
app.use("/api", wishlist);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API server is running",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/user",
      "/api/products",
      "/api/categories",
      "/api/cart",
      "/api/order",
    ],
  });
});

// API-only fallback for unknown routes
app.get("*", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    availableEndpoints: [
      "GET /",
      "POST /api/user/verifyMail",
      "GET /api/products",
      "GET /api/categories",
      "POST /api/cart/add",
      "POST /api/order/generate-pdf",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});

module.exports = app;
