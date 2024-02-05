const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "voteban",
        description: "Initiates a vote to ban a user from the server.",
        usage: "<user>"
    },
    permissions: "BanMembers",
    owner: false,
    run: async (client, message, args, prefix, config, db) => {
        if (!args[0]) return message.reply("Please specify a member to vote ban.");

        const memberToBan = message.mentions.members.first();
        if (!memberToBan) return message.reply("Invalid member mention.");

        const voteEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`Vote to Ban ${memberToBan.user.tag}`)
            .setThumbnail(memberToBan.user.displayAvatarURL())
            .setDescription(`A vote to ban ${memberToBan.user.tag} has been initiated.\nReact with 👍 to vote in favor or 👎 to vote against.\nVoting closes in 80 seconds.`)
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
                // Majority voted for ban
                try {
                    await memberToBan.ban();
                    const banEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`Member Banned`)
                        .setThumbnail(memberToBan.user.displayAvatarURL())
                        .setDescription(`${memberToBan.user.tag} has been banned from the server.`)
                        .setFooter({ text: `Ban initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                    await voteMessage.edit({ embeds: [banEmbed] });
                } catch (banError) {
                    if (banError.code === 50013) {
                        const banEmbed = new EmbedBuilder()
                            .setColor("Green")
                            .setTitle(`Failed to Ban Member`)
                            .setThumbnail(memberToBan.user.displayAvatarURL())
                            .setDescription(`Failed to ban ${memberToBan.user.tag}. Bot does not have sufficient permissions.`)
                            .setFooter({ text: `Ban initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                        console.error("Failed to ban member due to missing permissions.");
                        await voteMessage.edit({ embeds: [banEmbed] });
                    } else {
                        throw banError; // Rethrow error if it's not related to missing permissions
                    }
                }
            } else {
                // Ban vote failed
                const banVoteEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(`Ban Vote Failed`)
                    .setThumbnail(memberToBan.user.displayAvatarURL())
                    .setDescription(`The ban vote for ${memberToBan.user.tag} has failed.`)
                    .setFooter({ text: `Ban vote initiated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});
                await voteMessage.edit({ embeds: [banVoteEmbed] });
            }
        } catch (error) {
            console.error(error);
            await voteMessage.edit({ content: "An error occurred during the vote. Please try again." });
        }
    },
};
