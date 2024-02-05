const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'disableslowmode',
    description: 'Disables slow mode for a channel.',
    type: 1,
    options: [
        {
            name: 'channel',
            description: 'The channel to disable slowmode in.',
            type: 7,
            channelTypes: [0, 5], // Text channels and DMs
            required: true,
            autocomplete: true,
        },
    ],
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;
        const guildId = interaction.guild.id;
        if (focusedOption.name === "channel") {
            choices = interaction.guild.channels.cache
                .filter((channel) => channel.type == ChannelType.GuildText)
                .map((channel) => channel.name);
        }
        const filtered = choices
            .filter((choice) => choice.toLowerCase().startsWith(focusedOption.value))
            .slice(0, 25);
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    permissions: {
        DEFAULT_PERMISSIONS: 'ManageChannels',
        DEFAULT_MEMBER_PERMISSIONS: 'ManageChannels',
    },
    run: async (client, interaction, config, db) => {
        const channel = interaction.options.getChannel('channel');

        try {
            await channel.setRateLimitPerUser(0);

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('Slowmode Disabled')
                .setDescription(`Slowmode has been disabled in <#${channel.id}>.`)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL()});

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to disable slowmode. Please check permissions and try again.' });
        }
    },
};
