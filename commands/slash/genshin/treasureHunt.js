const { EmbedBuilder } = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  name: "treasurehunt",
  description: "Embark on a treasure hunt to find hidden rewards.",
  type: 1,
  options: [],
  cooldown: 20,
  permissions: {
    DEFAULT_PERMISSIONS: "",
    DEFAULT_MEMBER_PERMISSIONS: "",
  },
  run: async (client, interaction, config, db) => {
    // Check if the user exists in the database
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId }); // Use 'username' instead of 'id'

    if (!user) {
      await interaction.reply("you need to register first.");
      return;
    }
    // Check if the user has a cooldown for treasure hunt
    const cooldownTime = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = Date.now();

    if (
      user.lastTreasureHuntTimestamp &&
      now - user.lastTreasureHuntTimestamp < cooldownTime
    ) {
      const remainingTime =
        cooldownTime - (now - user.lastTreasureHuntTimestamp);
      const cooldownEmbed = new EmbedBuilder()
        .setTitle("Treasure Hunt Cooldown")
        .setDescription(
          `You can go on another treasure hunt in ${Math.ceil(
            remainingTime / 1000 / 60
          )} minutes.`
        )
        .setColor("#FF0000");

      return interaction.reply({
        embeds: [cooldownEmbed],
      });
    }

    // Simulate the treasure hunt (replace this with your own logic)
    const successfulHunt = Math.random() < 0.6; // 60% chance of success
    let reward;

    if (successfulHunt) {
      reward = {
        mora: Math.floor(Math.random() * 200) + 100,
        primogems: Math.floor(Math.random() * 25) + 1,
      };

      // Update user's rewards and lastTreasureHuntTimestamp
      user.mora += reward.mora;
      user.primogems += reward.primogems;
      user.lastTreasureHuntTimestamp = now;

      // Save the updated user data to the database
      await user.save();
    } else {
      // User didn't find any treasure this time
      reward = {
        mora: 0,
        primogems: 0,
      };
    }

    // Display the result to the user
    const treasureHunt = new EmbedBuilder()
      .setTitle("Treasure Hunt Result")
      .setDescription(
        successfulHunt
          ? `Congratulations! You found ${reward.mora} ${emojis.moraIcon} and ${reward.primogems} ${emojis.primogemIcon}!`
          : "Unfortunately, you didn't find any treasure this time."
      )
      .setColor(successfulHunt ? "#00FF00" : "#FF0000");

    interaction.reply({
      embeds: [treasureHunt],
    });
  },
};
