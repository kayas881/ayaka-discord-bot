const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const client = require("../../index");
const prefix = require("../../config/config.js").prefix;
const GuildSettings = require("./../../schemas/GuildSchema.js");
module.exports = {
  name: "guildCreate",
};

client.on("guildCreate", async (guild) => {
    // Check if the guild already exists in the database
    const existingGuild = await GuildSettings.findOne({ guildId: guild.id });
    if (existingGuild) {
        return; // Stop execution if the guild already exists
    }

    // If the guild does not exist, create a new GuildSettings document
    const newGuild = new GuildSettings({
        guildName: guild.name,
        guildId: guild.id,
        blacklistedChannels: [],
        disabledCommands: [],
        wishChannel: [],
        prefix: prefix,
    });

    // Save the new guild to the database
    await newGuild.save();
});

client.on("guildCreate",async (guild) => {

    // Find a channel where the bot can send messages
    const channel = guild.channels.cache.find(
        (channel) =>
            channel.type === ChannelType.GuildText &&
            channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
    );

    if (!channel) {
        return;
    }


    const greetingMessage = new EmbedBuilder()
        .setTitle("🌸 Ayaka has arrived! 🌸")
        .setDescription(
            "💰 **Economy:** Earn and manage your in-game currency.\n" +
            "📝 **Profile Customization:** Show off your unique style and achievements.\n" +
            "🌠 **Wish Listing:** Keep track of your favorite characters and weapons.\n" +
            "⚔️ **Character and Weapon Control:** Manage and upgrade your roster.\n" +
            "🥊 **PvP Battles:** Challenge your friends and prove who's the best!"
        )
        .addFields({name: '\u200B', value: `use aya register to register yourself to the database and get started`})
        .addFields({name: "\u200B", value: "Type /help-prefix and /help-slash  to see all the commands I offer. Let's embark on this adventure together! 🌟" })
        .setColor('Aqua')
        .setFooter({ text: "Excited to be here!" })
        .setTimestamp();

    // Send the embed message to the found channel
    channel.send({ embeds: [greetingMessage] })
        .catch(console.error);
});

