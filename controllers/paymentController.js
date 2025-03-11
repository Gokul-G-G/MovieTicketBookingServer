import crypto from "crypto";

import { Booking } from "../models/bookingsModel.js";
import { razorpayInstance } from "../utils/razorPay.js";

// Create an order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ message: "Amount & Booking ID required" });
    }

    const options = {
      amount: amount * 100, // Convert to paisa (₹100 -> 10000)
      currency,
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating payment order" });
  }
};

// Verify payment success
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update booking status to 'Paid'
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "Paid" });

    res.status(200).json({ message: "Payment verified successfully!" });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
