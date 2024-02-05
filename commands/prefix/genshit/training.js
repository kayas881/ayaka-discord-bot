const fs = require("fs");
const User = require("./../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const characterData = require("../../../Wishjsons/characters.json");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  increaseExperience,
} = require("../../../struct/xputills");

module.exports = {
  config: {
    name: "train",
    description:
      "Increases the user's adventurer rank experience, helping them level up",
    usage: "aya train",
    cooldown: 20,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    // Check if the user has a fishing rod
    let user = await User.findOne({ username: message.author.username });

    if (!user) {
      return message.reply("Please register first");
    }
    const trainingManual = user.items.find((item) => item.itemId === "3008");

    if (!trainingManual || trainingManual.count === 0) {
      return message.reply("You don't have a Training manual to use.");
    }

    // Use the Transient Resin to replenish Original Resin
    const username = message.author.username;
    const experienceGained = 100; // Replace with the actual experience gained
    await updateARRank(message, username, experienceGained, message.channel);
    // Decrement the Transient Resin count
    trainingManual.count--;
    await user.save();
    // Remove the Transient Resin if the count is zero
    if (trainingManual.count === 0) {
      user.items = user.items.filter((item) => item.itemId !== "3008");
    }

    // Save the updated user data
    await user.save();

    return message.channel.send(
      `You used a Training Manual,and you got ${experienceGained} ${emojis.xpIcon}.`
    );
  },
};
