const { EmbedBuilder } = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  name: "work",
  description: "Earn mora by working.",
  type: 1,
  options: [],
  cooldown: 20,
  permissions: {
    DEFAULT_PERMISSIONS: "",
    DEFAULT_MEMBER_PERMISSIONS: "",
  },
  run: async (client, interaction, config, db) => {
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId }); // Use 'username' instead of 'id'

    if (!user) {
      await interaction.reply("you need to register first.");
      return;
    }
    // Add a cooldown to prevent abuse (e.g., 1 hour cooldown)
    const cooldownTime = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = Date.now();

    if (user.lastWorkTimestamp && now - user.lastWorkTimestamp < cooldownTime) {
      const remainingTime = cooldownTime - (now - user.lastWorkTimestamp);
      const cooldownEmbed = new EmbedBuilder()
        .setTitle("Work Cooldown")
        .setDescription(
          `You can work again in ${Math.ceil(
            remainingTime / 1000 / 60
          )} minutes.`
        )
        .setColor("#FF0000");

      return interaction.reply({
        embeds: [cooldownEmbed],
      });
    }

    // Set up the work reward (adjust the values as needed)
    const moraEarned = Math.floor(Math.random() * 100) + 50;
    const primoEarned = Math.floor(Math.random() * 50) + 25;
    // Update user's mora and lastWorkTimestamp
    user.mora += moraEarned;
    user.primogems += primoEarned;
    user.lastWorkTimestamp = now;

    await user.save();
    // Save the updated user data to the database

    interaction.reply(
      `You worked and earned ${moraEarned} ${emojis.moraIcon} and ${primoEarned} ${emojis.primogemIcon}`
    );
  },
};
