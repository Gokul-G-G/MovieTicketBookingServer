import crypto from "crypto";

import { Booking } from "../models/bookingsModel.js";
import { razorpayInstance } from "../utils/razorPay.js";

// Create an order
export const createOrder = async (req, res) => {
  try {
    //  console.log("Incoming payment request:", req.body);
    const { amount, currency = "INR", bookingId } = req.body;

    if (!amount || !bookingId) {
      //  console.log("Error: Missing amount or bookingId");
      return res.status(400).json({ message: "Amount & Booking ID required" });
    }

    const options = {
      amount: amount * 100, // Convert to paisa (₹100 -> 10000)
      currency,
      receipt: `receipt_${bookingId}`,
    };
      // console.log(" Creating Razorpay Order with options:", options);
    const order = await razorpayInstance.orders.create(options);
        // console.log("✅ Razorpay Order Created:", order);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {

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

    // Verify Razorpay Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ Fetch booking & populate show
    const booking = await Booking.findById(bookingId).populate("show");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const show = booking.show;
    const selectedDate = show.dates.find(
      (d) => new Date(d.date).toISOString().split("T")[0] === booking.showDate
    );
    const selectedTimeSlot = selectedDate?.timeSlots.find(
      (slot) => slot.time === booking.showTime
    );

    if (!selectedTimeSlot) {
      return res.status(400).json({ message: "Invalid time slot in booking" });
    }

    // ✅ Mark booked seats
    booking.seats.forEach((bookedSeat) => {
      selectedTimeSlot.seatTypes.forEach((type) => {
        type.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (seat._id.toString() === bookedSeat.seatId.toString()) {
              seat.isBooked = true;
            }
          });
        });
      });
    });

    // ✅ Save updated documents
    await show.save();
    booking.paymentStatus = "Paid";
    await booking.save();

    res.status(200).json({ message: "Payment verified & seats confirmed!" });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
