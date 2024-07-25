const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');
const User = require('./../../../schemas/currencySchema')
const GuildSettings = require("./../../../schemas/GuildSchema");
// Define the feedback schema
const Feedback = require('./../../../schemas/feedbackSchema')
module.exports = {
    name: "feedback", // Name of command
    description: "Submit feedback", // Command description
    type: 1, // Command type
    options: [
        {
            name: 'feedback',
            description: 'Your feedback',
            type: 3,
            required: true
        }
    ], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const feedback = interaction.options.getString('feedback');
        const now = new Date();
        const week = getWeek(now);
        const year = now.getFullYear();

        // Check if the user has already given feedback this week
        const existingFeedback = await Feedback.findOne({username, userId, week, year });
        if (existingFeedback) {
            return interaction.reply('You can only give feedback once a week.');
        }

        // Save the feedback to the database
        const newFeedback = new Feedback({username, userId, feedback, week, year });
        await newFeedback.save();
        let user = await User.findOne({ username: interaction.user.username });
        const guild = await GuildSettings.findOne({ guildId: message.guild.id });
        console.log("mora:", user.mora, "primogems:", user.primogems)
        const moraReward = 3000;
        const primogemsReward = 300;
        
        // If user doesn't exist, create a new one
        if (!user) {
          return interaction.reply(`you are not registered in the database so you can't get the rewards. Please use the ${guild.prefix} register command to register yourself in the database.`)
        }
        
        user.mora += moraReward;
        user.primogems += primogemsReward;
        
        await user.save();
        console.log("mora:", user.mora, "primogems:", user.primogems)
        interaction.reply('Thank you for your feedback! You have been rewarded with 3000 Mora and 300 Primogems.');
    },
};

// Helper function to get the current week of the year
function getWeek(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - start) / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7);
}