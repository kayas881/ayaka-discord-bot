const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const superagent = require("superagent");

module.exports = {
  config: {
    name: "dance", // Name of Command
    description: "dances", // Command Description
    usage: "", // Command usage
    cooldown: 20,
  },
  permissions: "", // User permissions needed
  owner: false, // Owner only?
  run: async (client, message, args, prefix, config, db, interaction) => {
    let member = message.mentions.members.first();

    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/dance/gif`
    );

    const Dancingembed = new EmbedBuilder()
      .setTitle(`${message.author.username} is dancing`)
      .setColor("#6947F7")
      .setImage(
        `${body.link}
          `
      )
      .setTimestamp();

    message.reply({
      embeds: [Dancingembed],
    }); // execute
  },
};
