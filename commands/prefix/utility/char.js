const genshin = require("genshin-db");
const Discord = require("discord.js");

module.exports = {
  config: {
    name: "char",
    description: "Get a character information.",
    usage: "char [command]",
    cooldown: 10,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db) => {
    const input = args.join(" ");
    const char = genshin.characters(input);
    try {
      const embed = new Discord.EmbedBuilder()
        .setTitle(`**${char.name}**`)
        .setThumbnail(char.images.icon)
        .setColor("Blue")
        .addFields(
          { name: "Titles:", value: char.title, inline: false },
          { name: "Element:", value: char.element, inline: false },
          { name: "Weapon Type:", value: char.weapontype, inline: false },
          { name: "Gender:", value: char.gender, inline: false },
          { name: "Region:", value: char.region, inline: false },
          { name: "Rarity:", value: char.rarity, inline: false },
          { name: "Birthday:", value: char.birthday, inline: false },
          { name: "Constellation:", value: char.constellation, inline: false },
          { name: "Substat:", value: char.substat, inline: false },
          { name: "Affiliation:", value: char.affiliation, inline: false },
          { name: "Description:", value: char.description, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      message.channel.send("Character not in database");
    }
  },
};
