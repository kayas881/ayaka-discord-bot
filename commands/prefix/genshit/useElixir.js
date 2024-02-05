const User = require("./../../../schemas/currencySchema");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  config: {
    name: "buff",
    description: "Use an elixir to enhance your character's stats.",
    usage: "aya buff",
    cooldown: 20,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    // Check if the user has the Elixir of Enhancement
    let user = await User.findOne({ username: message.author.username });

    if (!user) {
      return message.reply("Please register first");
    }

    const elixir = user.items.find((item) => item.itemId === "3004");

    if (!elixir || elixir.count === 0) {
      return message.reply("You don't have the Elixir of Enhancement to use.");
    }

    // Check if the user already has an active elixir
    if (user.activeElixir === 1) {
      return message.reply(
        "You already have an active elixir. Wait for it to wear off before using another one."
      );
    }

    // Apply the elixir's effects (adjust the duration and stats as needed)
    const enhancementDuration = 120000; // 2 minutes in milliseconds
    const enhancedStats = {
      hp: 50, // Increase HP by 50 points
      atk: 20, // Increase ATK by 20 points
      def: 10, // Increase DEF by 10 points
    };

    // Save the current stats for later restoration
    const originalStats = Object.assign({}, user.toObject()); // Deep copy

    // Apply the enhancement
    user.totalHP += enhancedStats.hp;
    user.totalATK += enhancedStats.atk;
    user.totalDef += enhancedStats.def;

    // Decrease the count of the elixir
    elixir.count--;

    // Save the updated user data
    await user.save();

    // Display a message indicating the use of the elixir
    const elixirEmbed = new EmbedBuilder()
      .setTitle("Elixir of Enhancement")
      .setDescription(
        `You used the Elixir of Enhancement and gained temporary stat boosts:\n` +
          `HP +${enhancedStats.hp}, ATK +${enhancedStats.atk}, DEF +${enhancedStats.def}`
      )
      .setColor("Green");

    message.channel.send({ embeds: [elixirEmbed] });

    // Set the active elixir information
    user.activeElixir += 1;
    // Save the updated user data
    await user.save();

    // Wait for the enhancement duration and then restore the original stats
    setTimeout(async () => {
      user.totalHP = originalStats.totalHP;
      user.totalATK = originalStats.totalATK;
      user.totalDef = originalStats.totalDef;

      // Reset the active elixir information
      user.activeElixir -= 1;

      // Save the restored stats
      await user.save();

      // Display a message indicating the end of the enhancement
      const restoreEmbed = new EmbedBuilder()
        .setTitle("Elixir Wears Off")
        .setDescription(
          `The effects of the Elixir of Enhancement have worn off. Your stats have returned to normal.`
        )
        .setColor("Red");

      message.channel.send({ embeds: [restoreEmbed] });
    }, enhancementDuration);
  },
};
