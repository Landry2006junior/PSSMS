// controllers/parkingRecordController.js
const ParkingRecord = require("../models/ParkingRecord");
const ParkingSlot = require("../models/ParkingSlot");
const Payment = require("../models/Payment");
const Car = require("../models/Car");

// -----------------------------------------------
// HELPER: Calculate Duration and Fee
// Using your model field names: Entrytime, Exittime, duration
// -----------------------------------------------
const calculateFee = (Entrytime, Exittime) => {
  const durationMinutes = Math.max(
    0,
    Math.floor((Exittime - Entrytime) / (1000 * 60)),
  );
  const durationHours = Math.ceil(durationMinutes / 60) || 1;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  let hourlyRate = 500;
  let isExceeded = false;

  if (durationHours > 1) {
    isExceeded = true;
    hourlyRate = 1000;
  }

  const AmountPaid = durationHours * hourlyRate;

  return { duration, AmountPaid, durationMinutes, isExceeded, hourlyRate };
};

// -----------------------------------------------
// RECORD CAR ENTRY
// -----------------------------------------------
const recordEntry = async (req, res) => {
  try {
    const { plateNumber, SlotNumber } = req.body;
    // Note: 'plateNumber' lowercase p — matches your ParkingRecord model
    // Note: 'SlotNumber' uppercase — matches your ParkingRecord model

    // Validation: Request body must not be empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    // Validation: Both fields are required
    if (!plateNumber || !SlotNumber) {
      return res.status(400).json({
        message: "plateNumber and SlotNumber are required",
      });
    }

    // Validation: Fields cannot be empty spaces
    if (plateNumber.trim() === "" || SlotNumber.trim() === "") {
      return res.status(400).json({
        message: "plateNumber and SlotNumber cannot be empty",
      });
    }

    // Validation: Check car exists — ParkingRecord depends on Car existing first
    // Searching Car model using PlateNumber (uppercase P) — Car model naming
    const carFound = await Car.findOne({
      PlateNumber: plateNumber.trim().toUpperCase(),
    });
    if (!carFound) {
      return res.status(404).json({
        message: "Car not found. Please register the car first",
      });
    }

    // Validation: Check slot exists — ParkingRecord depends on ParkingSlot existing first
    const slotFound = await ParkingSlot.findOne({
      SlotNumber: SlotNumber.trim().toUpperCase(),
    });
    if (!slotFound) {
      return res.status(404).json({
        message: "Slot not found. Please add this slot first",
      });
    }

    // Business Logic: Car cannot enter if it already has an active session
    // Exittime: null means car has not left yet — using your field name 'Exittime'
    const alreadyParked = await ParkingRecord.findOne({
      plateNumber: plateNumber.trim().toUpperCase(),
      Exittime: null,
    });
    if (alreadyParked) {
      return res.status(400).json({
        message: "This car is already parked. Record exit first",
      });
    }

    // Business Logic: Slot must be Available before assigning to a car
    if (slotFound.SlotStatus === "Occupied") {
      return res.status(400).json({
        message: "This slot is currently occupied. Choose another slot",
      });
    }

    // Business Logic: Entrytime is auto-captured — cannot be manually entered
    const Entrytime = new Date();

    // Business Logic: Create ParkingRecord linking Car and ParkingSlot
    // Using your exact model field names: Car, plateNumber, slot, SlotNumber, Entrytime
    const newRecord = new ParkingRecord({
      Car: carFound._id, // ObjectId ref to Car model
      plateNumber: carFound.PlateNumber, // string copy — lowercase p your model
      slot: slotFound._id, // ObjectId ref to ParkingSlot model
      SlotNumber: slotFound.SlotNumber, // string copy — uppercase your model
      Entrytime, // auto-captured — your field name
      Exittime: null, // null = car still active — your field name
      duration: null, // calculated on exit — your field name
    });
    await newRecord.save();

    // Business Logic: Mark slot as Occupied immediately to block double booking
    await ParkingSlot.findByIdAndUpdate(slotFound._id, {
      SlotStatus: "Occupied",
    });

    res.status(201).json({
      message: "Car entry recorded successfully",
      record: newRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record entry", error: error.message });
  }
};

// -----------------------------------------------
// RECORD CAR EXIT
// -----------------------------------------------
const recordExit = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Validation: recordId must be provided in the URL
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    // Validation: recordId must be a valid MongoDB ObjectId
    if (!recordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Record ID format",
      });
    }

    // Business Logic: Find active record — Exittime null means car is still parked
    // Using your field name 'Exittime' (capital E lowercase t)
    const record = await ParkingRecord.findOne({
      _id: recordId,
      Exittime: null,
    });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Active parking record not found. Car may have already exited",
      });
    }

    // Business Logic: Exittime auto-captured at exit moment
    const Exittime = new Date();

    // Validation: Exittime must be after Entrytime
    if (Exittime <= record.Entrytime) {
      return res.status(400).json({
        success: false,
        message: "Exit time cannot be before or equal to entry time",
      });
    }

    // Business Logic: Use helper to calculate duration and fee
    const { duration, AmountPaid, durationMinutes, isExceeded, hourlyRate } =
      calculateFee(record.Entrytime, Exittime);

    // Validation: Duration must be positive
    if (durationMinutes < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid duration calculated",
      });
    }

    // Business Logic: Auto-generate payment with race condition prevention
    let newPayment;
    try {
      newPayment = new Payment({
        RecordId: record._id,
        AmountPaid,
        paymentDate: new Date(),
      });
      await newPayment.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Payment already exists for this record",
        });
      }
      throw error;
    }

    // Business Logic: Update ParkingRecord with exit details
    record.Exittime = Exittime;
    record.duration = duration;
    record.AmountPaid = AmountPaid;
    record.isExceeded = isExceeded;
    record.hourlyRate = hourlyRate;
    await record.save();

    // Business Logic: Free the slot
    await ParkingSlot.findOneAndUpdate(
      { SlotNumber: record.SlotNumber },
      { SlotStatus: "Available" },
    );

    // Business Logic: Return complete bill right after exit
    res.status(200).json({
      success: true,
      message: "Car exit recorded successfully",
      bill: {
        plateNumber: record.plateNumber,
        Entrytime: record.Entrytime,
        Exittime,
        duration,
        AmountPaid,
        isExceeded,
        paymentDate: newPayment.paymentDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record exit",
      error: error.message,
    });
  }
};

// -----------------------------------------------
// GET ALL RECORDS
// -----------------------------------------------
const getAllRecords = async (req, res) => {
  try {
    // Business Logic: Populate Car and slot refs to get full details
    // 'Car' (uppercase) and 'slot' (lowercase) — your ParkingRecord model field names
    const records = await ParkingRecord.find()
      .populate("Car", "PlateNumber DriverName phoneNumber")
      .populate("slot", "SlotNumber SlotStatus")
      .sort({ Entrytime: -1 });

    // Business Logic: Return the array (even if empty) for consistency
    res.status(200).json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch records", error: error.message });
  }
};

// -----------------------------------------------
// UPDATE RECORD
// -----------------------------------------------
const updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updates = req.body;

    // Validation: recordId must be provided
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    // Validation: Must be a valid MongoDB ObjectId
    if (!recordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Record ID format",
      });
    }

    // Validation: Update body must not be empty
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    // Validation: Protect critical fields from manual changes
    // Using your model field names: 'Car', 'slot', 'Entrytime'
    const protectedFields = ["Car", "slot", "Entrytime"];
    const attemptedProtected = protectedFields.filter(
      (field) => updates[field],
    );
    if (attemptedProtected.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot update protected fields: ${attemptedProtected.join(", ")}`,
      });
    }

    // Validation: If Exittime is being updated it must be after Entrytime
    // Using your field names 'Exittime' and 'Entrytime'
    if (updates.Exittime) {
      const record = await ParkingRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }
      const exitTime = new Date(updates.Exittime);

      // Check exit time is after entry time
      if (exitTime <= record.Entrytime) {
        return res.status(400).json({
          success: false,
          message: "Exit time must be after entry time",
        });
      }

      // Check exit time is not in the future
      if (exitTime > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Exit time cannot be in the future",
        });
      }
    }

    // Business Logic: Find and update — return new version with { new: true }
    const updated = await ParkingRecord.findByIdAndUpdate(recordId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("Car", "PlateNumber DriverName phoneNumber")
      .populate("slot", "SlotNumber SlotStatus");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      record: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update record",
      error: error.message,
    });
  }
};

// -----------------------------------------------
// DELETE RECORD
// -----------------------------------------------
const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Validation: recordId must be provided
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    // Validation: Must be a valid MongoDB ObjectId
    if (!recordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Record ID format",
      });
    }

    const record = await ParkingRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Business Logic: Cannot delete active record — car is still parked
    // Using your field name 'Exittime' (capital E lowercase t)
    if (record.Exittime === null) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an active record — car is still parked",
      });
    }

    // Business Logic: Delete the parking record
    await ParkingRecord.findByIdAndDelete(recordId);

    // Business Logic: Delete linked payment to keep data consistent
    // Relationship: Payment.RecordId references this ParkingRecord
    // Using your Payment model field name 'RecordId' (lowercase d)
    await Payment.findOneAndDelete({ RecordId: recordId });

    // Business Logic: Free the slot in case it was left Occupied
    await ParkingSlot.findOneAndUpdate(
      { SlotNumber: record.SlotNumber },
      { SlotStatus: "Available" },
    );

    res.status(200).json({
      success: true,
      message: "Record and related payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete record",
      error: error.message,
    });
  }
};

module.exports = {
  recordEntry,
  recordExit,
  getAllRecords,
  updateRecord,
  deleteRecord,
};
