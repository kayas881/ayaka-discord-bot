const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "kick", // Name of Command
        description: "Kicks a user from the server", // Command Description
        usage: "<user> [reason]", // Command usage
        cooldown: 5, // Command cooldown
    },
    permissions: "KickMembers", // User permissions needed
    owner: false, // Owner only?
    run: async (client, message, args, prefix, config, db) => {
        // Get the mentioned user from the message
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.channel.send("Please mention a valid member of this server");
        }

        // Check if the mentioned user is kickable
        if (!member.kickable) {
            return message.channel.send("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
        }

        // Get the reason for kicking
        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided";

        // Kick the mentioned user
        await member.kick(reason)
            .catch(error => {
                message.channel.send(`Sorry ${message.author} I couldn't kick because of : ${error}`);
            });

        // Send a success message
        message.channel.send(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
    },
};
