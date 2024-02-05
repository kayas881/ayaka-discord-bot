const { EmbedBuilder, Client, Intents, ChannelType } = require('discord.js');

module.exports = {
  config: {
    name: "sinfo",
    description: "Displays information about the server",
    usage: "!serverinfo",
  },
  permissions: "ManageGuild", // Required permission
  owner: false,
  run: async(client, message, args, prefix, config, db) => {
    const guild = message.guild;

    // const owner = await client.users.fetch(guild.ownerId); // Fetch the guild owner

    const embed = new EmbedBuilder()
    .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true })}) // Access url property
    .setColor("Random")
    .addFields(
      { name: "Members", value: guild.memberCount.toString(), inline: true },
      { name: "Created at", value: guild.createdAt.toLocaleString(), inline: true },
      { name: "Roles", value: guild.roles.cache.size.toString(), inline: true },
      { name: "Categories", value: guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size.toString(), inline: true },
      { name: "Text Channels", value: guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size.toString(), inline: true },
      { name: "Voice Channels", value: guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size.toString(), inline: true }
    );
  
  await message.channel.send({ embeds: [embed] }); // Updated send syntax
  },
};
