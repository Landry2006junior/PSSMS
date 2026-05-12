// models/Payment.js — CORRECTED (minimal changes)
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    RecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingRecord",
      required: true,
      unique: true,
    },
    AmountPaid: {
      type: Number,
      required: true,
      min: [500, "minimum charge for parking is 500rwf"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
