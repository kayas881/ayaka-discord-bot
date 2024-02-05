const Discord = require('discord.js');
const User = require('./../../../schemas/currencySchema');
const shop = require('../../../shop.json'); // Load the shop data from the json file

module.exports = {
  config: {
    name: "shop",
    description: "Shows the items available for purchase",
    usage: "shop",
  },
  permissions: ['SendMessages'],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    let user = await User.findOne({ id: message.author.id }); // or { discordTag: message.author.tag }
if (!user) {
  user = new User({
    id: message.author.id, // or discordTag: message.author.tag
    equippedProfilePic: 'default-profile-pic-url',
    equippedBanner: 'default-banner-url',
  });
  await user.save();
}

    // Create an embed to display the shop items
    const embed = new Discord.EmbedBuilder()
      .setTitle('Shop')
      .setDescription('Here are the items you can buy with your currency')
      .setColor('#ffcc00');

    // Loop through the shop items and add them to the embed fields
    for (const item of shop) {
      // Get the price of the item in either mora or primogems
      const price = item.price.mora ? `${item.price.mora} Mora` : `${item.price.primogems} Primogems`;
      // Add the item name, price and image to the embed field
      embed.addFields({name:item.name, value:price, inline:true});
      if (item.image) {
        embed.setImage(item.image);
      }
    }

    // Send the embed to the channel
    message.channel.send({ embeds: [embed] });
  }
};
