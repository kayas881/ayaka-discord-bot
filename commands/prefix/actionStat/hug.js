const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Discord = module.require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "hug",
    description: "Hugs another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/hug/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorAction;
    let targetAction;

    // Update the hug counts for the message author and the target
    try {
      authorAction =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorAction.huggedOthers++;
      await authorAction.save();

      targetAction =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetAction.gotHugged++;
      await targetAction.save();
    } catch (error) {
      console.error("Error updating hug counts:", error);
      // Handle the error as needed
    }
    // Embed for when the user hugs themselves
    if (member.id === message.author.id) {
      let HugEmbed = new EmbedBuilder()
        .setTitle(
          `${message.author.username}, you can't hug yourself, but come here, I'll hug you`
        )
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} hugged others ${authorAction.huggedOthers} times and got hugged ${authorAction.gotHugged} times!`,
        });

      return message.channel.send({ embeds: [HugEmbed] });
    }

    // Embed for when the user hugs someone else
    const HugEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} hugs ${member.user.username}`)
      .setColor("#6947F7")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} hugged others ${targetAction.huggedOthers} times and got hugged ${targetAction.gotHugged} times!`,
      });

    message.reply({ embeds: [HugEmbed2] });
  },
};
