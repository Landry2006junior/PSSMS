const express = require("express");
const router = express.Router();
const {
  addCar,
  getAllCars,
  deleteCar,
} = require("../controller/carcontroller");
const { protect } = require("../middleware/authmiddleware");

// All car routes are protected
router.post("/addCar", protect, addCar);
router.get("/getAllCars", protect, getAllCars);
router.delete("/deleteCar/:id", protect, deleteCar);

module.exports = router;
