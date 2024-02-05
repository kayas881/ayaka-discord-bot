const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "votekick",
        description: "Initiates a vote to kick or ban a user from the server.",
        usage: "<user>"
    },
    permissions: "KickMembers",
    owner: false,
    run: async (client, message, args, prefix, config, db) => {
        if (!args[0]) return message.reply("Please specify a member to vote kick.");

        const memberToKick = message.mentions.members.first();
        if (!memberToKick) return message.reply("Invalid member mention.");

        const voteEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`Vote to Kick ${memberToKick.user.tag}`)
          .setThumbnail(memberToKick.user.displayAvatarURL())
            .setDescription(`A vote to kick ${memberToKick.user.tag} has been initiated.\nReact with  to vote in favor or  to vote against.\nVoting closes in 80 seconds.`)
            .setFooter({ text: `Vote initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        const voteMessage = await message.channel.send({ embeds: [voteEmbed] });

        // Add reaction buttons for voting
        await voteMessage.react("👍");
        await voteMessage.react("👎");

        try {
            const filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== client.user.id;
            };

            const collected = await voteMessage.awaitReactions({ filter, time: 80000 });
            const votesFor = collected.filter(r => r.emoji.name === '👍').size;
            const votesAgainst = collected.filter(r => r.emoji.name === '👎').size;

            if (votesFor > votesAgainst) {
                // Majority voted for kick
                try {
                    await memberToKick.kick();
                    const kickEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`Member Kicked`)
                        .setThumbnail(memberToKick.user.displayAvatarURL())
                        .setDescription(`${memberToKick.user.tag} has been kicked from the server.`)
                        .setFooter({ text: `Kick initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                  await voteMessage.edit({ embeds: [kickEmbed] });
                } catch (kickError) {
                    if (kickError.code === 50013) {
                        const kickEmbed = new EmbedBuilder()
                            .setColor("Green")
                            .setTitle(`Failed to Kick Member`)
                            .setThumbnail(memberToKick.user.displayAvatarURL())
                            .setDescription(`Failed to kick ${memberToKick.user.tag}. Bot does not have sufficient permissions.`)
                            .setFooter({ text: `Kick initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                        console.error("Failed to kick member due to missing permissions.");
                        await voteMessage.edit({ embeds: [kickEmbed] });
                    } else {
                        throw kickError; // Rethrow error if it's not related to missing permissions
                    }
                }
            } else {
                // Kick vote failed
              const kickvoteEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle(`Kick Vote Failed`)
                .setThumbnail(memberToKick.user.displayAvatarURL())
                .setDescription(`The kick vote for ${memberToKick.user.tag} has failed.`)
                .setFooter({ text: `Kick vote initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                await voteMessage.edit({ embeds: [kickvoteEmbed] });
            }
        } catch (error) {
            console.error(error);
            await voteMessage.edit({ content: "An error occurred during the vote. Please try again." });
        }
    },
};
