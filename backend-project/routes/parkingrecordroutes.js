const express = require("express");
const router = express.Router();
const {
  recordEntry,
  recordExit,
  getAllRecords,
  updateRecord,
  deleteRecord,
} = require("../controller/parkingrecordcontroller");
const { protect } = require("../middleware/authmiddleware");

// All parking record routes are protected
router.post("/recordEntry", protect, recordEntry);
router.post("/recordExit/:recordId", protect, recordExit);
router.get("/getAllRecords", protect, getAllRecords);
router.put("/updateRecord/:recordId", protect, updateRecord);
router.delete("/deleteRecord/:recordId", protect, deleteRecord);

module.exports = router;
