// controllers/paymentController.js
const ParkingRecord = require("../models/ParkingRecord");
const Payment = require("../models/Payment");

// -----------------------------------------------
// GENERATE BILL FOR ONE SESSION
// -----------------------------------------------
const generateBill = async (req, res) => {
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

    // Business Logic: Fetch full record with Car and slot details
    // Populating 'Car' and 'slot' — your ParkingRecord field names
    const record = await ParkingRecord.findById(recordId)
      .populate("Car", "PlateNumber DriverName phoneNumber")
      .populate("slot", "SlotNumber");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Parking record not found",
      });
    }

    // Validation: Bill only generated after car has exited
    // Using your field name 'Exittime'
    if (record.Exittime === null) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate bill — car has not exited yet",
      });
    }

    // Business Logic: Fetch payment linked to this record
    // Using your Payment field name 'RecordId' (lowercase d)
    const payment = await Payment.findOne({ RecordId: recordId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this session",
      });
    }

    // Business Logic: Build and return complete bill
    // Using your exact field names throughout
    res.status(200).json({
      success: true,
      message: "Bill generated successfully",
      bill: {
        recordId: record._id,
        plateNumber: record.plateNumber,
        DriverName: record.Car?.DriverName,
        phoneNumber: record.Car?.phoneNumber,
        SlotNumber: record.SlotNumber,
        Entrytime: record.Entrytime,
        Exittime: record.Exittime,
        duration: record.duration,
        AmountPaid: payment.AmountPaid,
        paymentDate: payment.paymentDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate bill",
      error: error.message,
    });
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
        success: true,
        message: "No parking payments recorded today",
        report: [],
        total: 0,
      });
    }

    // Business Logic: For each payment fetch its ParkingRecord
    // Relationship: Payment.RecordId → ParkingRecord._id
    const report = await Promise.all(
      payments.map(async (payment) => {
        // Using your Payment field name 'RecordId' (lowercase d)
        const record = await ParkingRecord.findById(payment.RecordId).populate(
          "Car",
          "PlateNumber DriverName phoneNumber",
        );

        // Skip if record was deleted
        if (!record) return null;

        // Return report row using your exact field names
        return {
          recordId: record._id,
          plateNumber: record.plateNumber,
          DriverName: record.Car?.DriverName,
          SlotNumber: record.SlotNumber,
          Entrytime: record.Entrytime,
          Exittime: record.Exittime,
          duration: record.duration,
          AmountPaid: payment.AmountPaid,
          paymentDate: payment.paymentDate,
        };
      }),
    );

    // Business Logic: Filter out any null rows from deleted records
    const cleanReport = report.filter((row) => row !== null);

    // Calculate total revenue
    const totalRevenue = cleanReport.reduce(
      (sum, row) => sum + row.AmountPaid,
      0,
    );

    res.status(200).json({
      success: true,
      message: "Daily report generated successfully",
      report: cleanReport,
      total: cleanReport.length,
      totalRevenue,
      reportDate: new Date().toISOString().split("T")[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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
        path: "RecordId",
        select: "plateNumber SlotNumber Entrytime Exittime duration AmountPaid",
        populate: { path: "Car", select: "PlateNumber DriverName phoneNumber" },
      })
      .sort({ paymentDate: -1 });

    const formattedPayments = payments.map((p) => ({
      _id: p._id,
      plateNumber: p.RecordId?.plateNumber,
      SlotNumber: p.RecordId?.SlotNumber,
      Entrytime: p.RecordId?.Entrytime,
      Exittime: p.RecordId?.Exittime,
      duration: p.RecordId?.duration,
      Amount: p.AmountPaid,
      PaymentStatus: "Paid",
      paymentDate: p.paymentDate,
      recordId: p.RecordId?._id,
    }));

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: formattedPayments,
      total: formattedPayments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

module.exports = { generateBill, getDailyReport, getAllPayments };
