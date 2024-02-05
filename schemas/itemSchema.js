// Require mongoose
const mongoose = require("mongoose");

// Define the item schema
const itemSchema = new mongoose.Schema({
  name: String, // The name of the item
  rarity: Number, // The rarity of the item (1 to 5 stars)
  type: String, // The type of the item (character or weapon)
  image: String, // The image URL of the item
});

// Export the item model
module.exports = mongoose.model("Item", itemSchema);
