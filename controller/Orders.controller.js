const Orders = require("../model/Orders.model");
const { User } = require("../model/User.model");

// controller/Order.controller.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const generatePdfReceipt = async (req, res) => {
  const { user, orderSummary, selectedAddress } = req.body;

  try {
    const order = await Orders.findById(orderSummary.orderId).exec();
    if (!order) return res.status(404).json({ error: "Order not found" });

    const orderDate = order.createdAt;
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt_${orderSummary.orderId}.pdf"`
    );

    // Pipe the PDF directly to the response instead of saving to filesystem
    doc.pipe(res);

    // Add header
    doc.fontSize(25).text("Order Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(18).text("Customer Details", { underline: true });
    doc.fontSize(14).text(`Name: ${user.fullName}`);
    doc.fontSize(14).text(`Email: ${user.email}`);
    doc.fontSize(14).text(`Phone: ${selectedAddress.phoneNumber || "N/A"}`);
    doc.moveDown();

    doc.fontSize(18).text("Shipping Address", { underline: true });
    doc.fontSize(14).text(`House No.: ${selectedAddress.houseNo}`);
    doc.fontSize(14).text(`Street: ${selectedAddress.street}`);
    doc.fontSize(14).text(`Landmark: ${selectedAddress.landmark}`);
    doc.fontSize(14).text(`District: ${selectedAddress.district}`);
    doc
      .fontSize(14)
      .text(
        `City: ${selectedAddress.city}, ${selectedAddress.country} - ${selectedAddress.pincode}`
      );
    doc.moveDown();

    doc.fontSize(18).text("Order Details", { underline: true });
    doc.fontSize(14).text(`Order ID: ${orderSummary.orderId}`);
    doc.fontSize(14).text(
      `Date: ${new Date(orderDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    );
    doc.moveDown();

    doc.fontSize(18).text("Products Ordered", { underline: true });
    orderSummary.products.forEach((item) => {
      doc
        .fontSize(14)
        .text(
          `${item.product.title} (x${item.quantity}) - Rs. ${item.price.toFixed(
            2
          )}`
        );
      doc.moveDown();
    });

    doc
      .fontSize(16)
      .text(`Total Amount: Rs. ${orderSummary.totalAmount.toFixed(2)}`, {
        align: "right",
      });
    doc.moveDown();

    doc
      .fontSize(12)
      .text("Thank you for shopping with us!", { align: "center" });

    // End the document - this will trigger the response to be sent
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error generating PDF" });
    }
  }
};

const addOrder = async (req, res) => {
  try {
    const { userEmail, products, shippingAddress, totalAmount } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: "User not found" });
    const newOrder = new Orders({
      user: user._id,
      products,
      shippingAddress,
      totalAmount,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order", error });
  }
};

const getOrdersByUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const orders = await Orders.find({ user: user._id }).populate(
      "products.product"
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ message: "Failed to retrieve orders", error });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { totalAmount, orderId, products } = req.body;

    const productDetails = products.map((product) => ({
      title: product.product.title,
      price: product.price,
      image: product.product.thumbmnail,
    }));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      metadata: {
        orderId,
        products: JSON.stringify(productDetails),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      res.status(200).json({ message: "Order status updated successfully" });
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const searchQuery = req.query;
    const query = {};

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");

      query.$or = [
        { "user.email": regex },
        { "products.product.title": regex },
        { orderStatus: regex },
        { paymentStatus: regex },
      ];
    }

    const orders = await Orders.find(query)
      .populate({
        path: "user",
        select: "email",
      })
      .populate({
        path: "products.product",
        select: "title",
      })
      .exec();

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Update order status
const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status", error });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    await Orders.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
};

module.exports = {
  generatePdfReceipt,
  addOrder,
  getOrdersByUser,
  createPaymentIntent,
  updateOrderStatus,
  getAllOrders,
  updateOrderDeliveryStatus,
  deleteOrder,
};
