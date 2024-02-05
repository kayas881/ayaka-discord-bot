const { EmbedBuilder, Client, Intents, ChannelType } = require('discord.js');

module.exports = {
    config: {
        name: "userinfo",
        description: "Displays information about a user",
        usage: "!userinfo <@user>",
    },
    permissions: "ManageGuild", // Required permission
    owner: false,
    run: async(client, message, args, prefix, config, db) => {
        const user = message.mentions.users.first() || message.author;
       
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
           .setTitle(`User Info for ${user.tag}`)
            .setColor("Random")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Username", value: user.username, inline: true },
                { name: "Discriminator", value: user.discriminator, inline: false },
                { name: "ID", value: user.id, inline: true },
                { name: "Created at", value: user.createdAt.toLocaleString(), inline: false },
                { name: "Joined at", value: member.joinedAt.toLocaleString(), inline: true },
                { name: "Bot", value: user.bot ? "Yes" : "No", inline: false },
            );
        
        await message.channel.send({ embeds: [embed] });
    },
};
