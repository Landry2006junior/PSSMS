// controllers/reportController.js
const ParkingRecord = require("../models/ParkingRecord");
const Payment = require("../models/Payment");

// -----------------------------------------------
// GENERATE BILL FOR ONE SESSION
// -----------------------------------------------
const generateBill = async (req, res) => {
  try {
    const { RecordID } = req.params;

    // Validation: RecordID must be provided
    if (!RecordID) {
      return res.status(400).json({ message: "Record ID is required" });
    }

    // Validation: Must be a valid MongoDB ObjectId
    if (!RecordID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Record ID format" });
    }

    // Business Logic: Fetch full record with Car and slot details
    // Populating 'Car' and 'slot' — your ParkingRecord field names
    const record = await ParkingRecord.findById(RecordID)
      .populate("Car", "PlateNumber DriverName phoneNumber")
      .populate("slot", "SlotNumber");

    if (!record) {
      return res.status(404).json({ message: "Parking record not found" });
    }

    // Validation: Bill only generated after car has exited
    // Using your field name 'Exittime'
    if (record.Exittime === null) {
      return res.status(400).json({
        message: "Cannot generate bill — car has not exited yet",
      });
    }

    // Business Logic: Fetch payment linked to this record
    // Using your Payment field name 'RecordId' (lowercase d)
    const payment = await Payment.findOne({ RecordId: RecordID });
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found for this session",
      });
    }

    // Business Logic: Build and return complete bill
    // Using your exact field names throughout
    res.status(200).json({
      bill: {
        plateNumber: record.plateNumber,
        DriverName: record.Car?.DriverName,
        Entrytime: record.Entrytime,
        Exittime: record.Exittime,
        duration: record.duration,
        AmountPaid: payment.AmountPaid,
        paymentDate: payment.paymentDate,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to generate bill", error: error.message });
  }
};

// -----------------------------------------------
// DAILY PARKING REPORT
// -----------------------------------------------
const getDailyReport = async (req, res) => {
  try {
    // Business Logic: Define today's time range 00:00:00 to 23:59:59
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Business Logic: Find all payments made today
    // Using your Payment field name 'paymentDate' (lowercase p)
    const payments = await Payment.find({
      paymentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Validation: Inform if no payments recorded today
    if (payments.length === 0) {
      return res.status(200).json({
        message: "No parking payments recorded today",
        report: [],
      });
    }

    // Business Logic: For each payment fetch its ParkingRecord
    // Relationship: Payment.RecordId → ParkingRecord._id
    const report = await Promise.all(
      payments.map(async (payment) => {
        // Using your Payment field name 'RecordId' (lowercase d)
        const record = await ParkingRecord.findById(payment.RecordId);

        // Skip if record was deleted
        if (!record) return null;

        // Return report row using your exact field names
        return {
          plateNumber: record.plateNumber,
          Entrytime: record.Entrytime,
          Exittime: record.Exittime,
          duration: record.duration,
          AmountPaid: payment.AmountPaid,
        };
      }),
    );

    // Business Logic: Filter out any null rows from deleted records
    const cleanReport = report.filter((row) => row !== null);

    res.status(200).json({
      report: cleanReport,
      total: cleanReport.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate daily report",
      error: error.message,
    });
  }
};

// -----------------------------------------------
// GET ALL PAYMENTS
// -----------------------------------------------
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'RecordId',
        populate: { path: 'Car slot' }
      })
      .sort({ paymentDate: -1 });

    const formattedPayments = payments.map(p => ({
      _id: p._id,
      plateNumber: p.RecordId?.plateNumber,
      SlotNumber: p.RecordId?.SlotNumber,
      Entrytime: p.RecordId?.Entrytime,
      Exittime: p.RecordId?.Exittime,
      Amount: p.AmountPaid, // Mapping to Amount for frontend consistency
      PaymentStatus: 'Paid', // Assuming all in this collection are paid
      paymentDate: p.paymentDate
    }));

    res.status(200).json(formattedPayments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
};

module.exports = { generateBill, getDailyReport, getAllPayments };

