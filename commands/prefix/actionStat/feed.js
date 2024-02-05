const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "feed",
    description: "Feed another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/feed/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorAction;
    let targetAction;

    // Update the feed counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.fedOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotfed++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating feed counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user feeds themselves
    if (member.id === message.author.id) {
      let FeedEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}, feeding yourself? 🍲`)
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} fed others ${authorAction.fedOthers} times and got fed ${authorAction.gotfed} times!`,
        });

      return message.channel.send({ embeds: [FeedEmbed] });
    }

    // Embed for when the user feeds someone else
    const feedEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} fed ${member.user.username} 🍲`)
      .setColor("#FF69B4")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} fed others ${targetAction.fedOthers} times and got fed ${targetAction.gotfed} times!`,
      });

    message.reply({ embeds: [feedEmbed2] });
  },
};
