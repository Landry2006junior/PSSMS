const express = require("express");
const router = express.Router();
const { addCar, getAllCars, deleteCar } = require("../controller/carcontroller");

router.post("/addCar", addCar);
router.get("/getAllCars", getAllCars);
router.delete("/deleteCar/:id", deleteCar);

module.exports = router;
