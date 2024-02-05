const User = require("../../../schemas/currencySchema");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  config: {
    name: "editbio",
    description: "Edits user's bio",
    usage: "editbio <new bio>",
    cooldown: 20,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const newBio = args.join(" ");
    if (!newBio) {
      message.reply("Please provide a new bio!");
      return;
    }
    const user = await User.findOne({ username: message.author.username });
    if (!user) {
      message.reply(
        "You are not registered in the database. Use the !register command to get started!"
      );
      return;
    }
    const bioCost = 50;
    if (user.primogems < bioCost) {
      message.reply(`You need ${bioCost} primogems to edit your bio!`);
      return;
    }
    await User.findOneAndUpdate(
      { username: message.author.username },
      { bio: newBio, primogems: user.primogems - bioCost }
    );
    const color = parseInt("1E90FF", 16);
    const embed = new EmbedBuilder({
      color: color,
      title: `${message.author.username}'s Genshin Impact Profile`,
      thumbnail: {
        url: message.author.displayAvatarURL({
          format: "png",
          size: 256,
          dynamic: false,
        }),
      },
      description: `Successfully updated bio to: ${newBio}\n${bioCost} ${emojis.primogemIcon} have been deducted from your account.`,
    });
    message.channel.send({ embeds: [embed] });
  },
};
