const { Permissions } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  config: {
    name: "clear",
    description: "clear them messages",
    usage: "clear messages",
  },
  permissions: ["BanMembers"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply(
        `You do not have correct permissions to do this action`
      );

    if (!args[0]) {
      return message.reply(`Please enter a amount between 1 to 100`);
    }

    let int = args[0];
    int++;
    if (int > 100) int = 100;
    try {
      await message.delete();
      const fetch = await message.channel.messages.fetch({ limit: int });
      const deletedMessages = await message.channel.bulkDelete(fetch, true);

      const results = {};
      for (const [, deleted] of deletedMessages) {
        const user = `${deleted.author.username}#${deleted.author.discriminator}`;
        if (!results[user]) results[user] = 0;
        results[user]++;
      }

      const userMessageMap = Object.entries(results);
      const finalResult = `${deletedMessages.size} message${
        deletedMessages.size > 1 ? "s" : ""
      } were removed!\n\n${userMessageMap
        .map(([user, messages]) => `**${user}** : ${messages}`)
        .join("\n")}`;
      await message.channel
        .send({ content: finalResult })
        .then(async (msg) => setTimeout(() => msg.delete(), 1000));
    } catch (err) {
      if (String(err).includes("Unknown Message"))
        return console.log("[ERROR!] Unknown Message");
    }
  },
};
