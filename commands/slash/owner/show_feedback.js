const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Feedback = require('./../../../schemas/feedbackSchema');

module.exports = {
    name: "show_feedbacks", // Name of command
    description: "owner only....", // Command description
    type: 1, // Command type
    options: [], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
            // Check if the user is the bot owner
        if (interaction.user.id !== '909040277258399775') {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        // Fetch all feedbacks from the database
        const feedbacks = await Feedback.find({});

        // Define the number of feedbacks per page
        const feedbacksPerPage = 5;
        let page = 0;

        // Function to create an embed for a page
        function createEmbed(page) {
            const embed = new EmbedBuilder()
                .setTitle(`Feedbacks (Page ${page + 1})`)
                .setColor('#0099ff');

            // Add the feedbacks for this page to the embed
            for (let i = page * feedbacksPerPage; i < (page + 1) * feedbacksPerPage; i++) {
                if (i >= feedbacks.length) break;
                embed.addFields({name:`Feedback ${i + 1} by ${feedbacks[i].username}`, value: feedbacks[i].feedback})
                  
            }
        
            return embed;
        }

        // Create buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary),
            );

        // Send the embed with the buttons in the reply
        await interaction.reply({ embeds: [createEmbed(page)], components: [row] });

        // Create a collector to listen for button clicks
        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id === interaction.user.id) {
                if (i.customId === 'previous') {
                    if (page > 0) page--;
                } else if (i.customId === 'next') {
                    if ((page + 1) * feedbacksPerPage < feedbacks.length) page++;
                }

                // Update the embed
                await i.update({ embeds: [createEmbed(page)], components: [row] });
            } else {
                await i.reply({ content: 'You are not the one who initiated this command.', ephemeral: true });
            }
        });
    },
};