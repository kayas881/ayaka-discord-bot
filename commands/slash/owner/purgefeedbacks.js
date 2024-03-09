const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');
const User = require('./../../../schemas/currencySchema')
// Define the feedback schema
const Feedback = require('./../../../schemas/feedbackSchema')

module.exports = {
    name: "pfeeer", // Name of command
    description: "owner only......", // Command description
    type: 1, // Command type
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        if (interaction.user.id !== '909040277258399775') {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        const now = new Date();
        let week = getWeek(now);
        let year = now.getFullYear();

        // Calculate the previous week and year
        week--;
        if (week === 0) {
            week = 52;
            year--;
        }

        // Delete all feedbacks from the previous week and year
        await Feedback.deleteMany({ week, year });

        interaction.reply('All feedbacks from the previous week have been purged.');
    },
};

// Helper function to get the current week of the year
function getWeek(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - start) / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7);
}