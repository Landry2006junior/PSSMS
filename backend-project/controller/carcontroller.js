// controllers/carController.js
const Car = require("../models/Car");

// -----------------------------------------------
// ADD CAR
// -----------------------------------------------
const addCar = async (req, res) => {
  try {
    const { PlateNumber, DriverName, phoneNumber } = req.body;
    // Note: using 'phoneNumber' (lowercase p) to match your Car model

    // Validation: Request body must not be empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    // Validation: All three fields are required
    if (!PlateNumber || !DriverName || !phoneNumber) {
      return res.status(400).json({
        message: "PlateNumber, DriverName and phoneNumber are all required",
      });
    }

    // Validation: Fields cannot be empty spaces
    if (
      PlateNumber.trim() === "" ||
      DriverName.trim() === "" ||
      phoneNumber.trim() === ""
    ) {
      return res.status(400).json({
        message: "Fields cannot be empty or just spaces",
      });
    }

    // Validation: Rwanda plate number format e.g RAA 000 A
    const plateRegex = /^R[A-Z]{2}\s?\d{3}\s?[A-Z]$/;
    if (!plateRegex.test(PlateNumber.trim().toUpperCase())) {
      return res.status(400).json({
        message: "Invalid plate number format. Use format: RAA 000 A",
      });
    }

    // Validation: DriverName must contain letters only
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(DriverName.trim())) {
      return res.status(400).json({
        message: "Driver name must contain letters only",
      });
    }

    // Validation: DriverName length between 3 and 50 characters
    if (DriverName.trim().length < 3 || DriverName.trim().length > 50) {
      return res.status(400).json({
        message: "Driver name must be between 3 and 50 characters",
      });
    }

    // Validation: Rwanda phone number format 07XXXXXXXX
    const phoneRegex = /^(07[238]\d{7})$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({
        message: "Invalid phone number. Use Rwanda format: 07XXXXXXXX",
      });
    }

    // Business Logic: Prevent duplicate plate numbers — each car is unique
    const existingCar = await Car.findOne({
      PlateNumber: PlateNumber.trim().toUpperCase(),
    });
    if (existingCar) {
      return res.status(400).json({
        message: "A car with this plate number already exists",
      });
    }

    // Business Logic: Save car — PlateNumber stored in uppercase
    const newCar = new Car({
      PlateNumber: PlateNumber.trim().toUpperCase(),
      DriverName: DriverName.trim(),
      phoneNumber: phoneNumber.trim(),
    });
    await newCar.save();

    res.status(201).json({ message: "Car added successfully", car: newCar });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add car", error: error.message });
  }
};

// -----------------------------------------------
// GET ALL CARS
// -----------------------------------------------
const getAllCars = async (req, res) => {
  try {
    // Business Logic: Sort by most recently added first
    const cars = await Car.find().sort({ createdAt: -1 });

    // Business Logic: Return the array (even if empty) for consistency
    res.status(200).json(cars);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch cars", error: error.message });
  }
};

// -----------------------------------------------
// DELETE CAR
// -----------------------------------------------
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car", error: error.message });
  }
};

module.exports = { addCar, getAllCars, deleteCar };

