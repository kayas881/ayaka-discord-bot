const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Discord = module.require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "bite",
    description: "Bites another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/bite/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorAction;
    let targetAction;

    // Update the bite counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.bittenOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotBitten++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating bite counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user bites themselves
    if (member.id === message.author.id) {
      let BiteEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}, ARE YOU OKAY????`)
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} bit others ${authorAction.bittenOthers} times and got bitten ${authorAction.gotBitten} times!`,
        });

      return message.channel.send({ embeds: [BiteEmbed] });
    }

    // Embed for when the user bites someone else
    const biteEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} Bit ${member.user.username}`)
      .setColor("#6947F7")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} bit others ${targetAction.bittenOthers} times and got bitten ${targetAction.gotBitten} times!`,
      });

    message.reply({ embeds: [biteEmbed2] });
  },
};
