const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// Routes
const authroutes = require("./routes/authroutes");
const carroutes = require("./routes/carroutes");
const paymentroutes = require("./routes/paymentroutes");
const parkingslotroutes = require("./routes/parkingslotroutes");
const parkingrecordroutes = require("./routes/parkingrecordroutes");

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/auth", authroutes);
app.use("/api/cars", carroutes);
app.use("/api/payments", paymentroutes);
app.use("/api/parkingslots", parkingslotroutes);
app.use("/api/parkingrecords", parkingrecordroutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
