const { EmbedBuilder, ChannelType } = require("discord.js");
const { PermissionsBitField, Routes, REST, User } = require("discord.js");
const GuildSettings = require("./../../../schemas/GuildSchema");
module.exports = {
  config: {
    name: "create-wish-channel",
    description: "Creates a channel called 'wish'",
    usage: "!create-wish-channel",
  },
  permissions: "ManageChannels",
  owner: false,
  run: async (client, message, args, prefix, config, db) => {
    // Check if the channel already exists
    const existingChannel = message.guild.channels.cache.find(
      (channel) =>
        channel.name.toLowerCase() === "wish" &&
        channel.type === ChannelType.GuildText
    );

    if (existingChannel) {
      message.channel.send("The 'wish' channel already exists.");
      return;
    }

    // Create the channel
    const guild = message.guild;
    try {
      const channel = await guild.channels.create({
        name: "wish",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
      // push the newly created wish channel in the guild settings
      let guildSettings = await GuildSettings.findOne({ guildId: guild.id });
      if (!guildSettings) {
        guildSettings = new GuildSettings({ guildId: guild.id });
      }
      const wishChannel = guildSettings.wishChannel;
      wishChannel.push(channel.id);
      guildSettings.wishChannel = wishChannel;
      await guildSettings.save();

      // Success message
      message.channel.send(`Channel ${channel.name} has been created.`);
    } catch (error) {
      console.error("Error creating channel:", error.message);
      message.channel.send("Error creating the 'wish' channel.");
    }
  },
};
