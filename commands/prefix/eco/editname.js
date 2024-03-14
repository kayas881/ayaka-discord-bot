const User = require("../../../schemas/currencySchema");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
    config: {
      name: "editname",
      description: "Edits user's name",
      usage: "editname <new name>",
      cooldown: 20,
    },
    permissions: ["SendMessages"],
    owner: false,
    run: async (client, message, args, prefix, config, db, interaction) => {
      const newName = args.join(" ");
      if (!newName) {
        message.reply("Please provide a new name!");
        return;
      }
      const user = await User.findOne({ userId: message.author.id });
      if (!user) {
        message.reply(
          "You are not registered in the database. Use the !register command to get started!"
        );
        return;
      }
      const nameCost = 20;
      if (user.primogems < nameCost) {
        message.reply(`You need ${nameCost} primogems to edit your name!`);
        return;
      }
      await User.findOneAndUpdate(
        { userId: message.author.id },
        { name: newName, primogems: user.primogems - nameCost }
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
        description: `Successfully updated name to: ${newName}\n${nameCost} ${emojis.primogemIcon} have been deducted from your account.`,
      });
      message.channel.send({ embeds: [embed] });
    },
  };