const express = require("express");
const router = express.Router();
const {
  registeruser,
  loginuser,
  logout,
} = require("../controller/authcontroller");

router.post("/register", registeruser);
router.post("/login", loginuser);
module.exports = router;
