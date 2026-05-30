const express = require("express");
const router = express.Router();
const {
  generateBill,
  getDailyReport,
  getAllPayments,
} = require("../controller/paymentcontroller");

router.post("/generateBill/:RecordID", generateBill);
router.get("/getDailyReport", getDailyReport);
router.get("/getAllPayments", getAllPayments);

module.exports = router;

