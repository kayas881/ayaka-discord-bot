const User = require("../../../schemas/currencySchema");
const {
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "inventory",
  description: "Check your inventory",
  type: 1,
  options: [],
  cooldown: 5,
  permissions: {
    DEFAULT_PERMISSIONS: "",
    DEFAULT_MEMBER_PERMISSIONS: "",
  },
  run: async (client, interaction, config, db) => {
    try {
      const user = await User.findOne({ userId: interaction.user.id });

      if (!user) {
        interaction.reply(
          "Please use the register command to register in the database."
        );
        return;
      }

      // Create options for the StringSelectMenuBuilder
      const options = ["Banners", "Colors", "Items"];

      // Create a row with the StringSelectMenuBuilder
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder("Select a category")
          .addOptions(
            options.map((option) => ({
              label: option,
              value: option.toLowerCase(),
            }))
          )
      );

      // Create the initial inventory embed
      const initialEmbed = new EmbedBuilder()
        .setTitle("Inventory")
        .setDescription("Select a category to view your inventory:")
        .setColor("#3498db"); // Customize with appropriate color

      // Send the initial message with the select menu and inventory embed
      const message = await interaction.reply({
        content: "Select a category to view your inventory:",
        components: [row],
        embeds: [initialEmbed],
      });

      // Listen for the user's selection
      const filter = (interaction) => {
        return (
          interaction.customId === "select" &&
          interaction.user.id === user.userId
        );
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000, // 15 seconds
      });

      collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        const selectedCategory = interaction.values[0];

        // Handle the user's selection
        let items = [];
        if (selectedCategory === "banners") {
          items = user.inventory.filter((item) => item.itemType === "banner");
        } else if (selectedCategory === "colors") {
          items = user.inventory.filter((item) => item.itemType === "color");
        } else if (selectedCategory === "items") {
          items = user.items;
        }
        

        // Format the inventory items
        const inventoryItems = items
        .map((item) => `- ${item.itemName}`)
        .join("\n") || "No items in inventory";
      

        // Create or update the inventory embed
        const inventoryEmbed = new EmbedBuilder()
        .setTitle(`${selectedCategory} Inventory`)
        .setDescription(inventoryItems)
        .setColor("#3498db"); // Customize with appropriate color

        // Update the existing reply with the select menu and inventory embed
        await message.edit({
          components: [row],
          embeds: [inventoryEmbed],
        });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.followUp("Inventory selection timed out.");
        } else {
          // Create a new row with the StringSelectMenuBuilder
          const newRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("Select a category")
              .addOptions(
                options.map((option) => ({
                  label: option,
                  value: option.toLowerCase(),
                }))
              )
          );
        }
      });
    } catch (error) {
      console.error(error);
      interaction.reply("An error occurred while checking your inventory.");
    }
  },
};
