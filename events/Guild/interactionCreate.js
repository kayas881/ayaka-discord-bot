const { EmbedBuilder } = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const GuildSettings = require("./../../schemas/GuildSchema.js");
const commandCooldowns = new Map();
module.exports = {
  name: "interactionCreate",
};

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.slash_commands.get(interaction.commandName);

    if (!command) return;

    const guildId = interaction.guild.id;
    let guildSettings = await GuildSettings.findOne({ guildId });
    const disabledCommands = guildSettings.disabledCommands;

    if (disabledCommands.includes(command.name)) {
      return interaction.reply(
        `The command \`${command.name}\` is disabled in this server.`
      );
    }

    // Check if the command has a cooldown
    if (command.cooldown) {
      const key = `${interaction.user.id}:${interaction.commandName}`;
      const now = Date.now();
      const cooldownTime = command.cooldown * 1000; // Cooldown time in milliseconds

      if (commandCooldowns.has(key)) {
        const lastTime = commandCooldowns.get(key);

        // Check if the cooldown period has passed
        if (now - lastTime < cooldownTime) {
          const remainingTime = cooldownTime - (now - lastTime);
          return interaction.reply({
            content: `Please wait ${Math.ceil(
              remainingTime / 1000
            )} seconds before using this command again.`,
            ephemeral: true, // Set to true if you want the message to only be visible to the user who triggered the command
          });
        }
      }

      // Update the cooldown timestamp
      commandCooldowns.set(key, now);
    }

    try {
      command.run(client, interaction, config, db);
    } catch (e) {
      console.error(e);
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.slash_commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.isUserContextMenuCommand()) {
    // User:
    const command = client.user_commands.get(interaction.commandName);

    if (!command) return;

    try {
      command.run(client, interaction, config, db);
    } catch (e) {
      console.error(e);
    }
  }

  if (interaction.isMessageContextMenuCommand()) {
    // Message:
    const command = client.message_commands.get(interaction.commandName);

    if (!command) return;

    try {
      command.run(client, interaction, config, db);
    } catch (e) {
      console.error(e);
    }
  }

  if (interaction.isModalSubmit()) {
    // Modals:
    const modal = client.modals.get(interaction.customId);

    if (!modal)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "Something went wrong... Probably the Modal ID is not defined in the modals handler."
            )
            .setColor("Red"),
        ],
        ephemeral: true,
      });

    try {
      modal.run(client, interaction, config, db);
    } catch (e) {
      console.error(e);
    }
  }
});
