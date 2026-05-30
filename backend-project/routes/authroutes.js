const express = require("express");
const router = express.Router();
const {
  registeruser,
  loginuser,
  logout,
} = require("../controller/authcontroller");
const { protect } = require("../middleware/authmiddleware");

router.post("/register", registeruser);
router.post("/login", loginuser);
router.post("/logout", protect, logout);

module.exports = router;
