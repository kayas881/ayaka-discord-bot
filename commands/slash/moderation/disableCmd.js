const { EmbedBuilder } = require("discord.js");
const GuildSettings = require("./../../../schemas/GuildSchema");
module.exports = {
  name: "dsbcmd", // Name of command
  description: "Disable any commands in the server", // Command description
  type: 1, // Command type
  options: [
    // Command options
    {
      name: "command",
      description: "The command you want to disable",
      type: 3,
      required: true,
    },
  ], // Command options
  cooldown: 20,
  permissions: {
    DEFAULT_PERMISSIONS: "", // Client permissions needed
    DEFAULT_MEMBER_PERMISSIONS: "", // User permissions needed
  },
  run: async (client, interaction, config, db) => {
    // execute
    const command = interaction.options.getString("command");
    const guildId = interaction.guild.id;
    let guildSettings = await GuildSettings.findOne({ guildId });
    if (!guildSettings) {
      guildSettings = new GuildSettings({ guildId });
    }
    const disabledCommands = guildSettings.disabledCommands;
    const commandExists =
      client.slash_commands.has(command) || client.prefix_commands.has(command);
    if (!commandExists) {
      const embed = new EmbedBuilder()
        .setTitle("Command not found")
        .setDescription(
          `The command \`${command}\` does not exist. Please try again.`
        )
        .setColor("Red");
      return interaction.reply({ embeds: [embed] });
    }
    if (disabledCommands.includes(command)) {
      const embed = new EmbedBuilder()
        .setTitle("Command already disabled")
        .setDescription(
          `The command \`${command}\` is already disabled. Please try again.`
        )
        .setColor("Red");
      return interaction.reply({ embeds: [embed] });
    }
    disabledCommands.push(command);
    guildSettings.disabledCommands = disabledCommands;
    await guildSettings.save();

    const embed = new EmbedBuilder()
      .setTitle("Command disabled")
      .setDescription(`The command \`${command}\` has been disabled.`)
      .setColor("Green");
    return interaction.reply({ embeds: [embed] });
  },
};
