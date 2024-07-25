const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const GuildSettings = require("./../../../schemas/GuildSchema");

function getCommandFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      fileList = getCommandFiles(filePath, fileList); // Assign the result back to fileList
    } else if (file.endsWith(".js")) {
      fileList.push(filePath);
    }
  }

  return fileList;
}
const User = require("../../../schemas/currencySchema");
const {
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "help-prefix",
  description: "get a Prefix command list",
  type: 1,
  options: [],
  cooldown: 5,
  permissions: {
    DEFAULT_MEMBER_PERMISSIONS: "SendMessages",
  },
  category: "general",
  run: async (client, interaction, config, db) => {
    const user = await User.findOne({ userId: interaction.user.id });
    const guild = await GuildSettings.findOne({ guildId: interaction.guild.id });
    // Get all command files
    const commandFiles = getCommandFiles(
      path.join(__dirname, "./../../../commands/prefix")
    );
    let embed;

    // Group commands by category
    const categories = {};
    for (const file of commandFiles) {
      delete require.cache[require.resolve(file)];
      const command = require(file);
      const category = path.dirname(file).split(path.sep).pop();

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(command);
    }

    // Create a new embed
    embed = new EmbedBuilder().setDescription(
      "Here are all the commands available:"
    );

    // Initialize page index and total pages
    let pageIndex = 0;
    const categoryNames = Object.keys(categories);
    const totalPages = categoryNames.length;

    // Function to update the embed with the current page
    const updateEmbed = () => {
      const category = categoryNames[pageIndex];
      const commands = categories[category];
      // Update the embed title with the category name
      embed.setTitle(`Help - ${category}`);

      // Clear the existing fields and add the new field
      embed.setFields([]);
      for (const command of commands) {
        embed.addFields({
          name: `• **${guild.prefix} ${command.config.name}**`,
          value: command.config.description,
        });
      }
    };
    // Function to create the button row
    const createButtonRow = () => {
      const buttonRow = new ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageIndex === 0),
        new Discord.ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageIndex === totalPages - 1)
      );
      return buttonRow;
    };
    // Defer the reply to the interaction
    await interaction.deferReply();
    // Update the embed with the first page
    updateEmbed();

    // Send the initial embed to the user
    const helpMessage = await interaction.editReply({
      embeds: [embed],
      components: [createButtonRow()],
    });

    // Store the original user's id
    const originalUserId = interaction.user.id;
    // Create a collector to listen for button interactions
    const collector = helpMessage.createMessageComponentCollector({
      filter: (interaction) =>
        interaction.isButton() &&
        interaction.user &&
        interaction.user.id === originalUserId,
      time: 60000, // 1 minute
    });

    // Handle button interactions
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      if (interaction.customId === "previous") {
        pageIndex = Math.max(0, pageIndex - 1);
      } else if (interaction.customId === "next") {
        pageIndex = Math.min(totalPages - 1, pageIndex + 1);
      }

      // Update the embed with the new page
      updateEmbed();

      // Update the message with the new embed and buttons
      await interaction.editReply({
        embeds: [embed],
        components: [createButtonRow()],
        deferUpdates: false,
      });
    });

    // End the collector after 1 minute
    collector.on("end", () => {
      helpMessage.edit({ components: [] });
    });
  },
};
