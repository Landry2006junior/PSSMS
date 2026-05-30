const express = require("express");
const router = express.Router();
const {
  generateBill,
  getDailyReport,
  getAllPayments,
} = require("../controller/paymentcontroller");
const { protect } = require("../middleware/authmiddleware");

// All payment routes are protected
router.post("/generateBill/:recordId", protect, generateBill);
router.get("/getDailyReport", protect, getDailyReport);
router.get("/getAllPayments", protect, getAllPayments);

module.exports = router;
