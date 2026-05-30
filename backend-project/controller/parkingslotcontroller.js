// controllers/parkingSlotController.js
const ParkingSlot = require("../models/ParkingSlot");

// -----------------------------------------------
// ADD SLOT
// -----------------------------------------------
const addSlot = async (req, res) => {
  try {
    const { SlotNumber } = req.body;
    // Note: using 'SlotNumber' (uppercase S, uppercase N) to match your ParkingSlot model

    // Validation: Request body must not be empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    // Validation: SlotNumber is required
    if (!SlotNumber) {
      return res.status(400).json({ message: "SlotNumber is required" });
    }

    // Validation: SlotNumber cannot be empty spaces
    if (SlotNumber.trim() === "") {
      return res
        .status(400)
        .json({ message: "SlotNumber cannot be empty spaces" });
    }

    // Validation: SlotNumber format must follow pattern A1, B2, C10
    const slotRegex = /^[A-Z]\d{1,2}$/;
    if (!slotRegex.test(SlotNumber.trim().toUpperCase())) {
      return res.status(400).json({
        message: "Invalid slot format. Use format: A1, B2, C10",
      });
    }

    // Business Logic: Prevent duplicate slot numbers
    const existingSlot = await ParkingSlot.findOne({
      SlotNumber: SlotNumber.trim().toUpperCase(),
    });
    if (existingSlot) {
      return res
        .status(400)
        .json({ message: "This slot number already exists" });
    }

    // Business Logic: New slot always starts as Available
    // SlotStatus defaults to 'Available' from the model schema
    const newSlot = new ParkingSlot({
      SlotNumber: SlotNumber.trim().toUpperCase(),
    });
    await newSlot.save();

    res.status(201).json({
      message: "Parking slot added successfully",
      slot: newSlot,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add slot", error: error.message });
  }
};

// -----------------------------------------------
// GET ALL SLOTS
// -----------------------------------------------
const getAllSlots = async (req, res) => {
  try {
    // Business Logic: Sort slots alphabetically by SlotNumber
    const slots = await ParkingSlot.find()
      .sort({ SlotNumber: 1 })
      .collation({ locale: "en", numericOrdering: true });

    // Business Logic: Return the array (even if empty) for consistency
    res.status(200).json(slots);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch slots", error: error.message });
  }
};

// -----------------------------------------------
// GET AVAILABLE SLOTS ONLY
// -----------------------------------------------
const getAvailableSlots = async (req, res) => {
  try {
    // Business Logic: Only return slots with SlotStatus = 'Available'
    // Manager uses this to know which slot to assign to incoming car
    const slots = await ParkingSlot.find({ SlotStatus: "Available" })
      .sort({ SlotNumber: 1 })
      .collation({ locale: "en", numericOrdering: true });

    // Business Logic: Return the array (even if empty) for consistency
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch available slots",
      error: error.message,
    });
  }
};

// -----------------------------------------------
// DELETE SLOT
// -----------------------------------------------
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await ParkingSlot.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete slot", error: error.message });
  }
};

module.exports = { addSlot, getAllSlots, getAvailableSlots, deleteSlot };

