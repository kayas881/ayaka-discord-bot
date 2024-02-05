const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  blacklistedChannels: [{ type: String }],
  disabledCommands: [{ type: String }],
  wishChannel: [{ type: String }],
});

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);

module.exports = GuildSettings;
