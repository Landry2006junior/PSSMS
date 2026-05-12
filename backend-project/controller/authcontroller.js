const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registeruser = async (req, res) => {
  try {
    const { UserName, Email, Password } = req.body;
    const hashpwd = await bcrypt.hash(Password, 10);
    const newuser = new User({
      UserName,
      Email,
      Password: hashpwd,
    });
    await newuser.save();
    res.status(201).json({
      message: "User registered",
      user: { id: newuser._id, UserName: newuser.UserName },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginuser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const founduser = await User.findOne({ Email });
    if (!founduser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(Password, founduser.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({
      user: { id: founduser._id, UserName: founduser.UserName },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "Logged out" });
};

module.exports = { registeruser, loginuser, logout };
