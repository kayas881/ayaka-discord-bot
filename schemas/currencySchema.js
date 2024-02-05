const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema({
  itemName: String,
  itemType: String,
});
const purchaseHistorySchema = new mongoose.Schema(
  {
    itemId: String,
    purchaseDate: { type: Date, default: Date.now() },
    purchaseCount: { type: Number, default: 0 },
  },
  { _id: false }
);
const characterSchema = new mongoose.Schema(
  {
    characterId: String, // Update the field name to 'id'
    name: String,
    hp: { type: Number, default: 0 },
    atk: { type: Number, default: 0 },
    def: { type: Number, default: 0 },
    critRate: { type: Number, default: 0 },
    critDmg: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    constellation: { type: Number, default: 0 },
    activeConstellation: { type: Number, default: 0 },
  },
  { _id: false }
);
const weaponSchema = new mongoose.Schema(
  {
    weaponId: String, // Update the field name to 'id'
    name: String,
    hp: { type: Number, default: 0 },
    atk: { type: Number, default: 0 },
    def: { type: Number, default: 0 },
    critRate: { type: Number, default: 0 },
    critDmg: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    refinement: { type: Number, default: 0 },
    activeRefinement: { type: Number, default: 0 },
  },
  { _id: false }
);
const itemSchema = new mongoose.Schema(
  {
    itemId: String, // Update the field name to 'id'
    itemName: String,
    count: { type: Number, default: 0 },
  },
  { _id: false }
);
const equippedCharacterSchema = new mongoose.Schema({
  characterId: String, // Update the field name to 'id'
  name: String,
  hp: { type: Number, default: 0 },
  atk: { type: Number, default: 0 },
  def: { type: Number, default: 0 },
  critRate: { type: Number, default: 0 },
  critDmg: { type: Number, default: 0 },
  constellation: { type: Number, default: 0 },
  activeConstellation: { type: Number, default: 0 },
});

const equippedWeaponSchema = new mongoose.Schema({
  weaponId: String, // Update the field name to 'id'
  name: String,
  hp: { type: Number, default: 0 },
  atk: { type: Number, default: 0 },
  def: { type: Number, default: 0 },
  critRate: { type: Number, default: 0 },
  critDmg: { type: Number, default: 0 },
  refinement: { type: Number, default: 0 },
  activeRefinement: { type: Number, default: 0 },
});
const currencySchema = new mongoose.Schema({
  username: String,
  userId: String,
  mora: { type: Number, default: 0 },
  primogems: { type: Number, default: 0 },
  resin: { type: Number, default: 0 },
  resinTimestamp: { type: Number, default: Date.now() },
  lastResinRefresh: { type: Number, default: Date.now() },
  experience: { type: Number, default: 0 },
  rank: { type: Number, default: 1 },
  rankName: { type: String, default: "Adventurer" },
  bio: { type: String, default: "" },
  characters: [characterSchema],
  weapons: [weaponSchema], // Use the weaponSchema for the weapons array
  items: [itemSchema],
  activeElixir: { type: Number, default: 0 },
  favoriteCharacter: { type: String, default: "" },
  bannerUrl: { type: String, default: "https://i.imgur.com/2TR8kBp.jpeg" },
  equippedBanner: { type: String, default: "https://i.imgur.com/2TR8kBp.jpeg" },
  inventory: [inventorySchema],
  nameCard: { type: Number, default: 0 },
  pity5Star: { type: Number, default: 0 },
  wishesMade: { type: Number, default: 0 },
  pity4Star: { type: Number, default: 0 },
  pity3StarItem: { type: Number, default: 0 },
  hp: { type: Number, default: 0 },
  atk: { type: Number, default: 0 },
  equippedCharacter: [equippedCharacterSchema], // Store the character id as a string
  equippedWeapon: [equippedWeaponSchema], // Store the weapon id as a string
  totalHP: { type: Number, default: 0 },
  totalDef: { type: Number, default: 0 },
  totalATK: { type: Number, default: 0 },
  totalCritRate: { type: Number, default: 0 },
  totalCritDmg: { type: Number, default: 0 },
  lastWorkTimestamp: { type: Number, default: 0 },
  lastTreasureHuntTimestamp: { type: Number, default: 0 },
  interactionId: { type: String, default: null }, // Add the interactionId field
  pvpBattleWon: { type: Number, default: 0 },
  equippedColor: { type: String, default: "#ffcc00" },
  lastDailyClaim: { type: Number, default: 0 },
  lastWeeklyClaim: { type: Number, default: 0 },
  userXpLimit: { type: Number, default: 0 },
  lastXpReset: { type: Number, default: Date.now() },
  purchaseHistory: [purchaseHistorySchema],
});

module.exports = mongoose.model("User", currencySchema);
