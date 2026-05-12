const express = require("express");
const router = express.Router();
const {
  addSlot,
  getAllSlots,
  getAvailableSlots,
  deleteSlot,
} = require("../controller/parkingslotcontrolller");

router.post("/addSlot", addSlot);
router.get("/getAllSlots", getAllSlots);
router.get("/getAvailableSlots", getAvailableSlots);
router.delete("/deleteSlot/:id", deleteSlot);

module.exports = router;
