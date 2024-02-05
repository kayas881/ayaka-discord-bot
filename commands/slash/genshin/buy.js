const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const bannersData = require("./../../../banners.json");
const itemsData = require("./../../../Wishjsons/items.json");
module.exports = {
  name: "buy",
  description: "Buys an item from the shop",
  type: 1,
  options: [
    {
      name: "item_type",
      description: "The type of item you want to buy",
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
        {
          name: "item",
          value: "item",
        },
      ],
      required: true,
    },
    {
      name: "item",
      description: "The specific item you want to buy",
      type: 3, // String type
      choices: [], // Empty initially, to be populated dynamically
      required: true,
      autocomplete: true, // Enable autocomplete
    },
  ],
  cooldown: 20,
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
      choices = bannersData.colors.map((color) => color.name);
    } else if (itemType === "item") {
      choices = itemsData.items.map((item) => item.name);
    } else {
      return interaction.respond("Invalid item type selected.");
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
      interaction.reply(
        "Please use the register command to register in the database."
      );
      return;
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
    } else if (itemType === "item") {
      item = itemsData.items.find((i) => i.name.toLowerCase() === itemName);
      choices = itemsData.items.map((item) => ({
        name: item.name,
        value: item.name,
      }));
    } else {
      return interaction.reply("Invalid item type selected.");
    }

    if (!item) {
      return interaction.reply(`That ${itemType} does not exist in the shop.`);
    }
    let price = item.price.primogems || 0;
    let currency = "primogems";

    if (item.price.mora) {
      price = item.price.mora;
      currency = "mora";
    }

    if (user[currency] < price) {
      return interaction.reply(
        `You do not have enough ${currency} to buy this ${itemType}.`
      );
    }
    // Check if the user has already bought this item 3 times today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set the time to 00:00:00

    let totalPurchasesToday = 0;

    if (itemType === "item") {
      // Only check purchase history for items
      const purchaseHistory = user.purchaseHistory.filter(
        (purchase) =>
          purchase.itemId === item.id &&
          new Date(purchase.purchaseDate).getTime() >= today.getTime()
      );

      totalPurchasesToday = purchaseHistory.reduce(
        (total, purchase) => total + purchase.purchaseCount,
        0
      );
    }

    if (totalPurchasesToday >= 3) {
      return interaction.reply(
        `You have already bought ${item.name} 3 times today. Please wait until tomorrow to buy again.`
      );
    }

    user[currency] -= price;

    if (itemType === "banner") {
      let itemExists = false;
      for (let i = 0; i < user.inventory.length; i++) {
        if (
          user.inventory[i].itemType === "banner" &&
          user.inventory[i].itemName === item.name
        ) {
          itemExists = true;
          break;
        }
      }
      if (!itemExists) {
        user.inventory.push({
          itemName: item.name,
          itemType: item.type,
        });
      }
    } else if (itemType === "color") {
      let itemExists = false;
      for (let i = 0; i < user.inventory.length; i++) {
        if (
          user.inventory[i].itemType === "color" &&
          user.inventory[i].itemName === item.name
        ) {
          itemExists = true;
          break;
        }
      }
      if (!itemExists) {
        user.inventory.push({
          itemName: item.name,
          itemType: item.type,
        });
      }
    } else if (itemType === "item") {
      let itemExists = false;
      for (let i = 0; i < user.items.length; i++) {
        if (user.items[i].itemId === item.id) {
          // Changed item.name to item.id
          user.items[i].count += 1;
          itemExists = true;
          break;
        }
      }

      if (!itemExists) {
        user.items.push({
          itemName: item.name,
          itemId: item.id,
          count: 1,
        });
      }
    } else {
      return interaction.reply("Invalid item type selected.");
    }
    // Update the user's purchase history
    // Update the user's purchase history only for items
    if (itemType === "item") {
      const existingPurchase = user.purchaseHistory.find(
        (purchase) =>
          purchase.itemId === item.id &&
          new Date(purchase.purchaseDate).getTime() >= today.getTime()
      );

      if (existingPurchase) {
        existingPurchase.purchaseCount += 1;
      } else {
        user.purchaseHistory.push({
          itemId: item.id,
          purchaseDate: new Date(),
          purchaseCount: 1,
        });
      }
    }

    await user.save();

    interaction.reply(
      `You have successfully bought ${item.name} for ${price} ${currency}.`
    );
},

};
