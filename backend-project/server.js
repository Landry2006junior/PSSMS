const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.port || 5000;
require("dotenv").config();
const authroutes = require("./routes/authroutes");
const carroutes = require("./routes/carroutes");
const paymentroutes = require("./routes/paymentroutes");
const parkingslotroutes = require("./routes/parkingslotroutes");
const parkingrecordroutes = require("./routes/parkingrecordroutes");

app.use(cors());
app.use(express.json());

//mount routes
//mount routes
app.use("/api/auth", authroutes);
app.use("/api/cars", carroutes);
app.use("/api/payments", paymentroutes);
app.use("/api/parkingslots", parkingslotroutes);
app.use("/api/parkingrecords", parkingrecordroutes);


mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("connected to the database successfully");
    app.listen(process.env.port, () => {
      console.log(`server is running on port ${process.env.port}`);
    });
  })
  .catch((error) => {
    console.log("error connecting to the database", error);
  });
