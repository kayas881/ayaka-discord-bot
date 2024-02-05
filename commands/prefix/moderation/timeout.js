const { EmbedBuilder } = require('discord.js');
const ms = require('ms'); // for parsing time strings

module.exports = {
  config: {
    name: "timeout",
    description: "Times out a member for a specified duration.",
    usage: "!timeout <member> <duration> [reason]",
  },
  permissions: "ManageMessages", // Required permission
  owner: false,
  run: async (client, message, args, prefix, config, db) => {
    // Check for required arguments
    if (!args[0] || !args[1]) {
      return message.reply("Please provide a member and duration for the timeout.");
    }

    // Fetch the member to timeout
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply("Invalid member mention.");
    }

    // Parse the duration string
    const duration = ms(args[1]);
    if (isNaN(duration)) {
      return message.reply("Invalid duration format. Please use a human-readable format like '5m' or '1h'.");
    }

    // Optional reason for the timeout
    const reason = args.slice(2).join(" ");

    // Timeout the member
    try {
      await member.timeout(duration, reason);

      // Create an embed for confirmation
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`${member.user.tag} has been timed out`)
        .addFields({ name: "Duration:", value: ms(duration, { long: true }), inline: true })
        .addFields({ name: "Reason:", value: reason || "No reason provided."})
        .setFooter({ text: `Timed out by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("Failed to timeout the member. Please check my permissions and try again.");
    }
  },
};
