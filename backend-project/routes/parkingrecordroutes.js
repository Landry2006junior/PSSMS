const express = require("express");
const router = express.Router();
const {
  recordEntry,
  recordExit,
  getAllRecords,
  updateRecord,
  deleteRecord,
} = require("../controller/parkingrecordcontroller");

router.post("/recordEntry", recordEntry);
router.post("/recordExit/:RecordID", recordExit);
router.get("/getAllRecords", getAllRecords);
router.put("/updateRecord/:RecordID", updateRecord);
router.delete("/deleterecord/:RecordID", deleteRecord);
module.exports = router;
