// models/ParkingRecord.js — CORRECTED
const mongoose = require("mongoose");

const parkingrecordSchema = new mongoose.Schema(
  {
    Car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
      required: true,
    },
    SlotNumber: {
      type: String,
      required: true,
    },
    Entrytime: {
      type: Date,
      default: Date.now,
    },
    Exittime: {
      type: Date,
      default: null,
    },
    duration: {
      type: String,
      default: null,
    },
    AmountPaid: {
      type: Number,
      default: 0,
    },
    isExceeded: {
      type: Boolean,
      default: false,
    },
    hourlyRate: {
      type: Number,
      default: 500,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ParkingRecord", parkingrecordSchema);
