const { Permissions } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  config: {
    name: "ban",
    description: "Bans the user",
    usage: "ban",
    cooldown: 20,
  },
  permissions: ["BanMembers"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.BanMembers
        // PermissionsBitField.Flags.ADMINISTRATOR
      )
    )
      return message.reply("You don't have permission to use that command.");
    if (!args[0])
      return message.reply({ content: `Please specify a user to ban` });
    if (member.id == message.author.id)
      return message.reply("You cant ban yourself!");

    return (
      (await member.ban()) +
      message.reply({ content: `User ${member} has been banned` })
    );
  },
};
