const { EmbedBuilder } = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const bannersData = require("./../../../banners.json");

module.exports = {
  name: "edit",
  description: "Equips an item from your inventory",
  type: 1,
  options: [
    {
      name: "item_type",
      description: "The type of item you want to equip",
      type: 3, // String type
      choices: [
        {
          name: "Banner",
          value: "banner",
        },
        {
          name: "Color",
          value: "color",
        },
      ],
      required: true,
    },
    {
      name: "item",
      description: "The item you want to equip",
      type: 3, // String type
      choices: [], // To be populated dynamically based on item_type
      required: true,
      autocomplete: true,
    },
  ],
  cooldown: 10,
  permissions: {
    DEFAULT_PERMISSIONS: "", // Client permissions needed
    DEFAULT_MEMBER_PERMISSIONS: "", // User permissions needed
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const itemType = interaction.options.getString("item_type").toLowerCase();

    let choices;

    if (itemType === "banner") {
      choices = bannersData.banners.map((banner) => banner.name);
    } else if (itemType === "color") {
      // Assume you have a colorsData object with the necessary data
      choices = bannersData.colors.map((color) => color.name);
    } else {
      return;
    }

    const filtered = choices
      .filter((choice) => choice.toLowerCase().startsWith(focusedOption.value))
      .slice(0, 25);

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  run: async (client, interaction, config, db) => {
    const itemType = interaction.options.getString("item_type").toLowerCase();
    const itemName = interaction.options.getString("item").toLowerCase();
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user) {
      return interaction.reply(
        "Please register in the database before using this command."
      );
    }

    let item;
    let choices;

    if (itemType === "banner") {
      item = bannersData.banners.find((i) => i.name.toLowerCase() === itemName);
      choices = bannersData.banners.map((banner) => ({
        name: banner.name,
        value: banner.name,
      }));
    } else if (itemType === "color") {
      item = bannersData.colors.find((i) => i.name.toLowerCase() === itemName);
      choices = bannersData.colors.map((color) => ({
        name: color.name,
        value: color.name,
      }));
    } else {
      return interaction.reply("Invalid item type selected.");
    }

    if (!item) {
      return interaction.reply(`That ${itemType} does not exist in the shop.`);
    }
    // Check if the user has the selected item in their inventory
    if (
      !user.inventory.map((i) => i.itemName.toLowerCase()).includes(itemName)
    ) {
      return interaction.reply(
        `You do not have ${item.itemName} in your inventory.`
      );
    }

    const price = item.price.primogems || 0;
    const currency = "primogems";
    // Additional logic to check and apply the equip action based on the item type
    if (item.type === "banner") {
      user.equippedBanner = item.image;
    } else if (item.type === "color") {
      user.equippedColor = item.value;
    } else {
      return interaction.reply("That item cannot be equipped.");
    }

    await user.save();
    interaction.reply(`You have successfully equipped ${item.name}.`);
  },
};
