const fs = require("fs");
const User = require("./../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const characterData = require("../../../Wishjsons/characters.json");
const { EmbedBuilder } = require("discord.js");

const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  increaseExperience,
} = require("../../../struct/xputills");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  config: {
    name: "fish",
    description: "Fish using the fishing rod and get random rewards",
    usage: "aya fish",
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

    const fishingRod = user.items.find((item) => item.itemId === "3001");

    if (!fishingRod || fishingRod.count === 0) {
      return message.reply("You don't have a fishing rod to use.");
    }

    // Generate random rewards
    const rewards = generateRandomRewards();

    // Add rewards to the user's currency
    user.mora += rewards.mora;
    user.primogems += rewards.primogems;

    // Increment the user's experience points (adjust the amount as needed)
    const username = message.author.username;
    const experienceGained = 100; // Replace with the actual experience gained
    await updateARRank(message, username, experienceGained, message.channel);
    // Decrement the fishing rod count
    fishingRod.count--;

    // Remove the fishing rod if the count is zero
    if (fishingRod.count === 0) {
      user.items = user.items.filter((item) => item.itemId !== "3001");
    }

    // Save the updated user data after removing the fishing rod
    await user.save();

    // Send the success message
    return message.channel.send(
      `You used a fishing rod and got ${rewards.mora} ${emojis.moraIcon}, ${rewards.primogems} ${emojis.primogemIcon}, and more! You gained ${experienceGained} ${emojis.xpIcon} points!`
    );

    // Helper function to generate random rewards
    function generateRandomRewards() {
      // Define the rewards and their probabilities here
      const rewards = {
        mora: Math.floor(Math.random() * 1000),
        primogems: Math.floor(Math.random() * 10),
      };

      return rewards;
    }
  },
};
