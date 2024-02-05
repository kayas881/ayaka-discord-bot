const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "lick",
    description: "Lick another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/lick/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");
    let authorAction;
    let targetAction;

    // Update the lick counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.lickedOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotlicked++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating kiss counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user licks themselves
    if (member.id === message.author.id) {
      let LickEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}, you like licking yourself? 😜`)
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} licked others ${authorAction.lickedOthers} times and got licked ${authorAction.gotKissed} times!`,
        });

      return message.channel.send({ embeds: [LickEmbed] });
    }

    // Embed for when the user licks someone else
    const lickEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} licked ${member.user.username} 😜`)
      .setColor("#FF69B4")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} licked others ${targetAction.lickedOthers} times and got licked ${targetAction.gotlicked} times!`,
      });

    message.reply({ embeds: [lickEmbed2] });
  },
};
