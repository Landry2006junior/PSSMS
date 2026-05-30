const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registeruser = async (req, res) => {
  try {
    const { UserName, Email, Password } = req.body;

    if (!UserName || !Email || !Password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashpwd = await bcrypt.hash(Password, 10);
    const newuser = new User({
      UserName: UserName.trim(),
      Email: Email.toLowerCase().trim(),
      Password: hashpwd,
    });

    await newuser.save();
    res.status(201).json({
      message: "User registered",
      user: {
        id: newuser._id,
        UserName: newuser.UserName,
        Email: newuser.Email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginuser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const founduser = await User.findOne({ Email: Email.toLowerCase() }).select(
      "+Password",
    );

    if (!founduser || !(await bcrypt.compare(Password, founduser.Password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: founduser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: founduser._id,
        UserName: founduser.UserName,
        Email: founduser.Email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { registeruser, loginuser, logout };
