const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "av",
    description: "get avatar of the user",
    usage: "info [command]",
    cooldown: 10,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const user = message.mentions.users.first() || message.author;
    const avatarEmbed = new EmbedBuilder()
      .setColor("#1F8B4C")
      .setAuthor({
        name: `${user.tag}`,
        iconURL: `${user.displayAvatarURL({
          dynamic: true,
          size: 512,
        })}`,
      })
      .setImage(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Called By: ${message.author.tag}` })
      .setTimestamp();
    message.channel.send({ embeds: [avatarEmbed] });
  },
};
