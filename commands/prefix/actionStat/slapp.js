const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const Action = require("../../../schemas/ActionSchemas/ActionSchema");

module.exports = {
  config: {
    name: "slap",
    description: "Slap another user",
    usage: "",
    cooldown: 20,
  },
  permissions: "",
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    var member = message.mentions.members.first();
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/slap/gif`
    );

    if (!member) return message.channel.send("You need to mention someone");

    let authorSlapCount;
    let targetSlapCount;

    // Update the slap counts for the message author and the target
    try {
      authorSlapCount =
        (await Action.findOne({ userId: message.author.id })) ||
        new Action({ userId: message.author.id });
      authorSlapCount.slappedOthers++;
      await authorSlapCount.save();

      targetSlapCount =
        (await Action.findOne({ userId: member.id })) ||
        new Action({ userId: member.id });
      targetSlapCount.gotslapped++;
      await targetSlapCount.save();
    } catch (error) {
      console.error("Error updating slap counts:", error);
      // Handle the error as needed
    }

    // Embed for when the user slaps themselves
    if (member.id === message.author.id) {
      let SlapEmbed = new EmbedBuilder()
        .setTitle(
          `${message.author.username}, why are you slapping yourself? 😅`
        )
        .setColor(0xf000ff)
        .setImage(body.link)
        .setFooter({
          text: `${message.author.username} slapped others ${authorSlapCount.slappedOthers} times and got slapped ${authorSlapCount.gotslapped} times!`,
        });

      return message.channel.send({ embeds: [SlapEmbed] });
    }

    // Embed for when the user slaps someone else
    const slapEmbed2 = new EmbedBuilder()
      .setTitle(`${message.author.username} slapped ${member.user.username} 😅`)
      .setColor("#FF69B4")
      .setImage(body.link)
      .setFooter({
        text: `${member.user.username} slapped others ${targetSlapCount.slappedOthers} times and got slapped ${targetSlapCount.gotslapped} times!`,
      });

    message.reply({ embeds: [slapEmbed2] });
  },
};
