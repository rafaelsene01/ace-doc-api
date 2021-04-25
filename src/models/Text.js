const mongoose = require("mongoose");

const Text = new mongoose.Schema(
  {
    _id: String,
    text: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("text", Text);
