const { Guild } = require("discord.js");
const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildName: { type: String, required: true },
  guildId: { type: String, required: true, unique: true },
  blacklistedChannels: [{ type: String }],
  disabledCommands: [{ type: String }],
  wishChannel: [{ type: String }],
  prefix: { type: String, default: "aya" },
});

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);

module.exports = GuildSettings;
