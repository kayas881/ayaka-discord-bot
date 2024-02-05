// togglexp.js
const {
  SlashCommandBuilder,
  GuildChannel,
  ChannelType,
} = require("discord.js");
const GuildSettings = require("./../../../schemas/GuildSchema");
module.exports = {
  name: "blacklist",
  description: "set channels blacklist for the xp.",
  type: 1,
  options: [
    {
      name: "channel",
      description: "The channel you want to blacklist",
      type: 7,
      required: true,
      autocomplete: true,
    },
  ],
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;
    const guildId = interaction.guild.id;
    if (focusedOption.name === "channel") {
      choices = interaction.guild.channels.cache
        .filter((channel) => channel.type == ChannelType.GuildText)
        .map((channel) => channel.name);
    }
    const filtered = choices
      .filter((choice) => choice.toLowerCase().startsWith(focusedOption.value))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  permissions: {
    DEFAULT_MEMBER_PERMISSIONS: "Administrator",
  },

  category: "moderation",
  run: async (client, interaction, config) => {
    try {
      // Get the channel ID from the interaction
      const channelId = interaction.options.getChannel("channel").id;
      const guildId = interaction.guild.id;

      // Find or create guild settings
      let guildSettings = await GuildSettings.findOne({ guildId });
      if (!guildSettings) {
        guildSettings = new GuildSettings({ guildId });
      }

      // Toggle the blacklisted status of the current channel
      const index = guildSettings.blacklistedChannels.indexOf(channelId);
      if (index === -1) {
        guildSettings.blacklistedChannels.push(channelId);
      } else {
        guildSettings.blacklistedChannels.splice(index, 1);
      }

      // Save the updated guild settings
      await guildSettings.save();

      // Respond to the interaction with a confirmation message
      const isBlacklisted = index === -1;
      const response = isBlacklisted
        ? "XP gain is now disabled in this channel."
        : "XP gain is now enabled in this channel.";
      interaction.reply(response);
    } catch (error) {
      console.error("Error executing /togglexp command:", error);
      interaction.reply("An error occurred while processing the command.");
    }
  },
};
