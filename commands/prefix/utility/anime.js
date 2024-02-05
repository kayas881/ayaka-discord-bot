const Discord = require("discord.js");
const malScraper = require("mal-scraper");
const { MessageEmbed, EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: "anime", // Name of Command
    description: "Ask them questions", // Command Description
    usage: "", // Command usage
    cooldown: 10,
  },
  permissions: "", // User permissions needed
  owner: false, // Owner only?
  run: async (client, message, args, prefix, config, db, interaction) => {
    const search = `${args}`;
    if (!search)
      return message.reply(
        "Please add a search query if invalid command will not work."
      );

    malScraper.getInfoFromName(search).then((data) => {
      const malEmbed = new EmbedBuilder()
        .setThumbnail(data.picture)
        .setColor("Blue")
        .setTitle(data.englishTitle || data.title)
        .setDescription(data.japaneseTitle)
        .addFields({ name: "Type", value: data.type || "none", inline: true })
        .addFields({
          name: "Episodes",
          value: data.episodes || "none",
          inline: true,
        })
        .addFields({
          name: "Rating",
          value: data.rating || "none",
          inline: true,
        })
        .addFields({ name: "Aired", value: data.aired || "none", inline: true })
        .addFields({ name: "Score", value: data.score || "none", inline: true })
        .addFields({
          name: "Score Stats",
          value: data.scoreStats || "none",
          inline: true,
        })
        .addFields({ name: "Synopsis", value: data.synopsis });

      message.channel.send({ embeds: [malEmbed] });
    });
  },
};
