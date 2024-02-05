const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "pat",
    description: "Pat another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/pat/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorAction;
    let targetAction;

    // Update the action counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.pattedOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotpatted++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating action counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user pats themselves
    if (member.id === message.author.id) {
      let PatEmbed = new EmbedBuilder()
        .setTitle(`${message.author.username}, giving yourself a pat? 🥺`)
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} patted others ${authorAction.pattedOthers} times and got patted ${authorAction.gotpatted} times!`,
        });

      return message.channel.send({ embeds: [PatEmbed] });
    }

    // Embed for when the user pats someone else
    const patEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} patted ${member.user.username} 🥺`)
      .setColor("#FF69B4")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} patted others ${targetAction.pattedOthers} times and got patted ${targetAction.gotpatted} times!`,
      });

    message.reply({ embeds: [patEmbed2] });
  },
};
