const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  bittenOthers: { type: Number, default: 0 },
  gotBitten: { type: Number, default: 0 },
  fedOthers: { type: Number, default: 0 },
  gotfed: { type: Number, default: 0 },
  huggedOthers: { type: Number, default: 0 },
  gotHugged: { type: Number, default: 0 },
  kissedOthers: { type: Number, default: 0 },
  gotKissed: { type: Number, default: 0 },
  lickedOthers: { type: Number, default: 0 },
  gotlicked: { type: Number, default: 0 },
  slappedOthers: { type: Number, default: 0 },
  gotslapped: { type: Number, default: 0 },
  pattedOthers: { type: Number, default: 0 },
  gotpatted: { type: Number, default: 0 },
});

module.exports = mongoose.model("Action", ActionSchema);
