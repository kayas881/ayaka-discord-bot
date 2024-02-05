const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "kiss",
    description: "Kiss another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/kiss/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorAction;
    let targetAction;

    // Update the kiss counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.kissedOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotKissed++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating kiss counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user kisses themselves
    if (member.id === message.author.id) {
      let KissEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}, sending kisses to yourself? 😘`)
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} kissed others ${authorAction.kissedOthers} times and got kissed ${authorAction.gotKissed} times!`,
        });

      return message.channel.send({ embeds: [KissEmbed] });
    }

    // Embed for when the user kisses someone else
    const kissEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} kissed ${member.user.username} 😘`)
      .setColor("#FF69B4")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} kissed others ${targetAction.kissedOthers} times and got kissed ${targetAction.gotKissed} times!`,
      });

    message.reply({ embeds: [kissEmbed2] });
  },
};
