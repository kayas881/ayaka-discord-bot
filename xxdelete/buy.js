const Discord = require('discord.js');
const User = require('./../../../schemas/currencySchema');
const shop = require('./../../../shop.json'); // Load the shop data from the json file

module.exports = {
  config: {
    name: "buy",
    description: "Buys an item from the shop",
    usage: "buy <item name>",
  },
  permissions: ['SendMessages'],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    let user = await User.findOne({ username: message.author.username }); // or { discordTag: message.author.tag }
if (!user) {
  user = new User({
    id: message.author.id, // or discordTag: message.author.tag
    equippedProfilePic: 'default-profile-pic-url',
    equippedBanner: 'default-banner-url',
  });
  await user.save();
}

    // Get the item name from the arguments
    const itemName = args.join(' ').toLowerCase();

    // Find the item in the shop data
    const item = shop.find(i => i.name.toLowerCase() === itemName);

    // If the item is not found, send an error message
    if (!item) {
      return message.channel.send('That item does not exist in the shop.');
    }

    // Check if the user has enough currency to buy the item
    const price = item.price.mora || item.price.primogems;
    const currency = item.price.mora ? 'mora' : 'primogems';
    if (user[currency] < price) {
      return message.channel.send(`You do not have enough ${currency} to buy this item.`);
    }

    // Deduct the price from the user's currency
    user[currency] -= price;
    
    // Add the item to the user's inventory

    user.inventory.push(item.name);
    // Save the user data
    await user.save();

    // Send a confirmation message
    message.channel.send(`You have successfully bought ${item.name} for ${price} ${currency}.`);
  }
};
