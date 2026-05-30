const express = require("express");
const router = express.Router();
const {
  addSlot,
  getAllSlots,
  getAvailableSlots,
  deleteSlot,
} = require("../controller/parkingslotcontroller");
const { protect } = require("../middleware/authmiddleware");

// All parking slot routes are protected
router.post("/addSlot", protect, addSlot);
router.get("/getAllSlots", protect, getAllSlots);
router.get("/getAvailableSlots", protect, getAvailableSlots);
router.delete("/deleteSlot/:id", protect, deleteSlot);

module.exports = router;
