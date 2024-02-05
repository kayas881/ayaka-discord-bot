const Discord = require("discord.js");
const User = require("../schemas/currencySchema");
const shop = require("./../../../shop.json"); // Load the shop data from the json file

module.exports = {
  config: {
    name: "use",
    description: "Equips an item from your inventory",
    usage: "equip <item name>",
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    let user = await User.findOne({ username: message.author.username });

    if (!user) {
      user = new User({
        id: message.author.id,
        equippedProfilePic: "default-profile-pic-url",
        equippedBanner: "default-banner-url",
        inventory: [], // Initialize the inventory as an empty array
      });
      await user.save();
    }

    const itemName = args.join(" ").toLowerCase(); // Convert input to lowercase

    if (!user.inventory.map((item) => item.toLowerCase()).includes(itemName)) {
      return message.channel.send(
        "You do not have that item in your inventory."
      );
    }

    const item = shop.find((i) => i.name.toLowerCase() === itemName); // Compare in lowercase

    if (!item) {
      return message.channel.send("That item does not exist in the shop.");
    }

    if (item.type === "pfp") {
      user.equippedProfilePic = item.image;
    } else if (item.type === "banner") {
      user.equippedBanner = item.image;
    } else {
      return message.channel.send("That item cannot be equipped.");
    }

    // Remove the item from the user's inventory (compare in lowercase)
    user.inventory = user.inventory.filter((i) => i.toLowerCase() !== itemName);

    await user.save();

    message.channel.send(`You have successfully equipped ${item.name}.`);
  },
};
