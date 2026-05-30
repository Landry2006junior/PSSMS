const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    Password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
