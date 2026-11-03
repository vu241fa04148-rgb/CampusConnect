const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ["lost", "found"], required: true },
  category: { type: String, default: "Other" },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["active", "claimed", "closed"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
