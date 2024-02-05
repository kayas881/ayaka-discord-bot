const {
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const shopData = require("./../../../banners.json");
const itemsData = require('./../../../Wishjsons/items.json')
let currentPage = 0; // Global variable to keep track of the current page
let selectedCategoryData = {}; // Object to store category and related data

module.exports = {
  name: "preview",
  description: "Show shop items",
  type: 1,
  options: [],
  cooldown: 20,
  permissions: {
    DEFAULT_PERMISSIONS: "",
    DEFAULT_MEMBER_PERMISSIONS: "",
  },
  run: async (client, interaction, config, db) => {
    // Create categories
    const categories = ["Banners", "Colors", "Items" ];
    let items = []; // Initialize items as an empty array

    // Create a Select Menu for categories
    const categorySelect = new StringSelectMenuBuilder()
      .setCustomId("categorySelect")
      .setPlaceholder("Select a category")
      .addOptions(
        categories.map((category) => ({
          label: category,
          value: category,
        }))
      );

    // Create Buttons for navigation
    const prevButton = new ButtonBuilder()
      .setCustomId("prevButton")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
      .setCustomId("nextButton")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary);

    // Create Action Row for buttons
    const buttonRow = new ActionRowBuilder().addComponents(
      prevButton,
      nextButton
    );

    // Send the initial message with Select Menu and Buttons
    await interaction.reply({
      content: "Welcome to the shop preview!",
      components: [
        new ActionRowBuilder().addComponents(categorySelect),
        buttonRow,
      ],
    });

    const filter = (interaction) => {
      return (
        interaction.customId === "categorySelect" ||
        interaction.customId === "prevButton" ||
        interaction.customId === "nextButton"
      );
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      let maxItemsPerPage = 1;

      if (interaction.customId === "categorySelect") {
        selectedCategoryData = {
          category: interaction.values[0],
          items: [],
        };
        if (selectedCategoryData.category === "Banners") {
          selectedCategoryData.items = shopData.banners;
        } else if (selectedCategoryData.category === "Colors") {
          selectedCategoryData.items = shopData.colors;
        } else if (selectedCategoryData.category === "Items") {
          selectedCategoryData.items = itemsData.items; // Handle "Items" category
        }
       
        
        // Update the pageItems calculation
        const startIndex = currentPage * maxItemsPerPage;
        const endIndex = (currentPage + 1) * maxItemsPerPage;
        selectedCategoryData.pageItems = selectedCategoryData.items.slice(
          startIndex,
          endIndex
        );

        const embed = new EmbedBuilder()
          .setTitle(
            `${selectedCategoryData.category} - Page ${currentPage + 1}`
          )
          .setColor("#7289DA")
          .addFields(
            selectedCategoryData.pageItems.map((item) => ({
              name: item.name,
              value: `Price: ${item.price.primogems ? item.price.primogems : item.price.mora} ${item.price.primogems ? 'Primogems' : 'Mora'}`,
              inline: true,
            }))
          )
          if (selectedCategoryData.category === "Banners") {
            embed.setImage(selectedCategoryData.pageItems[0].image);
          }
          else if(selectedCategoryData.category === "Items"){
            embed.setThumbnail(selectedCategoryData.pageItems[0].image)
            embed.setDescription(selectedCategoryData.pageItems[0].description);
          }

        if (!interaction.deferred) {
          await interaction.deferUpdate();
        }

        await interaction.editReply({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(categorySelect),
            buttonRow,
          ],
        });
      } else if (interaction.customId === "prevButton") {
        currentPage = Math.max(currentPage - 1, 0);
        const startIndex = currentPage * maxItemsPerPage;
        const endIndex = (currentPage + 1) * maxItemsPerPage;
        selectedCategoryData.pageItems = selectedCategoryData.items.slice(
          startIndex,
          endIndex
        );

        const embed = new EmbedBuilder()
          .setTitle(
            `${selectedCategoryData.category} - Page ${currentPage + 1}`
          )
          .setColor("#7289DA")
          .addFields(
            selectedCategoryData.pageItems.map((item) => ({
              name: item.name,
              value: `Price: ${item.price.primogems ? item.price.primogems : item.price.mora} ${item.price.primogems ? 'Primogems' : 'Mora'}`,
              inline: true,
            }))
          )
          if (selectedCategoryData.category === "Banners") {
            embed.setImage(selectedCategoryData.pageItems[0].image);
          }
          else if(selectedCategoryData.category === "Items"){
            embed.setThumbnail(selectedCategoryData.pageItems[0].image)
            embed.setDescription(selectedCategoryData.pageItems[0].description);
          }
        if (!interaction.deferred) {
          await interaction.deferUpdate();
        }

        await interaction.editReply({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(categorySelect),
            buttonRow,
          ],
        });
      } else if (interaction.customId === "nextButton") {
        const maxPage =
          Math.ceil(selectedCategoryData.items.length / maxItemsPerPage) - 1;
        currentPage = Math.min(currentPage + 1, maxPage);
        const startIndex = currentPage * maxItemsPerPage;
        const endIndex = (currentPage + 1) * maxItemsPerPage;
        selectedCategoryData.pageItems = selectedCategoryData.items.slice(
          startIndex,
          endIndex
        );

        const embed = new EmbedBuilder()
          .setTitle(
            `${selectedCategoryData.category} - Page ${currentPage + 1}`
          )
          .setColor("#7289DA")
          .addFields(
            selectedCategoryData.pageItems.map((item) => ({
              name: item.name,
              value: `Price: ${item.price.primogems ? item.price.primogems : item.price.mora} ${item.price.primogems ? 'Primogems' : 'Mora'}`,
              inline: true,
            }))
          )
          if (selectedCategoryData.category === "Banners") {
            embed.setImage(selectedCategoryData.pageItems[0].image);
          }
          else if(selectedCategoryData.category === "Items"){
            embed.setThumbnail(selectedCategoryData.pageItems[0].image)
            embed.setDescription(selectedCategoryData.pageItems[0].description);
          }

        if (!interaction.deferred) {
          await interaction.deferUpdate();
        }

        await interaction.editReply({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(categorySelect),
            buttonRow,
          ],
        });
      }

      if (!interaction.deferred) {
        await interaction.deferUpdate();
      }

      await interaction.editReply(`Switched to Page ${currentPage + 1}`);
    });

    collector.on("end", (collected) => {
      // Remove components after interaction ends
      interaction.editReply({ components: [] });
    });
  },
};
