const fs = require("fs");
const User = require("./../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const characterData = require("../../../Wishjsons/characters.json");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  config: {
    name: "resin",
    description:
      "An item that can be used to replenish Original Resin. e.g. +60resin",
    usage: "aya resin",
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    // Check if the user has a fishing rod
    let user = await User.findOne({ username: message.author.username });

    if (!user) {
      return message.reply("Please register first");
    }
    const transientResin = user.items.find((item) => item.itemId === "3002");

    if (!transientResin || transientResin.count === 0) {
      return message.reply("You don't have a Transient Resin to use.");
    }

    // Use the Transient Resin to replenish Original Resin
    user.resin += 60; // You can adjust the amount as needed

    // Decrement the Transient Resin count
    transientResin.count--;

    // Remove the Transient Resin if the count is zero
    if (transientResin.count === 0) {
      user.items = user.items.filter((item) => item.itemId !== "3002");
    }

    // Save the updated user data
    await user.save();

    return message.channel.send(
      `You used a Transient Resin to replenish 60 ${emojis.resinIcon}`
    );
  },
};
