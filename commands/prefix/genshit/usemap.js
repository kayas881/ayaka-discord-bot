const User = require("./../../../schemas/currencySchema");
const { EmbedBuilder } = require("discord.js");
const emojis = require("./../../../utilitiesJsons/emojis.json");
const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  increaseExperience,
} = require("../../../struct/xputills");
module.exports = {
  config: {
    name: "usemap",
    description: "Use a treasure map to find hidden treasure!",
    usage: "aya usemap",
    cooldown: 20,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    // Check if the user has a treasure map
    let user = await User.findOne({ username: message.author.username });

    if (!user) {
      return message.reply("Please register first");
    }
    const fortuneSlip = user.items.find((item) => item.itemId === "3006");
    const treasureMap = user.items.find((item) => item.itemId === "3003");

    if (!treasureMap || treasureMap.count === 0) {
      return message.reply("You don't have a treasure map to use.");
    }
    const findingGif =
      "https://upload-os-bbs.hoyolab.com/upload/2020/03/27/5789515/46aa55bc939a2c3632d2eec683184fec_2412966685494962307.gif";
    const chestImg =
      "https://images-ext-1.discordapp.net/external/SsGUm6j_gwb44v3ikzjocxQ8z_LLlK7wc9g-uCqXL3o/%3Fcb%3D20230615014749/https/static.wikia.nocookie.net/gensin-impact/images/0/02/Item_Exquisite_Chest.png/revision/latest/thumbnail/width/360/height/360?width=396&height=396";
    // Display "finding treasure" gif
    const findingTreasureEmbed = new EmbedBuilder()
      .setTitle("Finding Treasure...")
      .setImage(findingGif)
      .setColor("Aqua");

    const findingTreasureMessage = await message.channel.send({
      embeds: [findingTreasureEmbed],
    });

    // Simulate finding treasure (you can adjust the timing or add more effects)
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Example: 5 seconds

    // Generate random rewards
    const rewards = generateRandomRewards();
    if (fortuneSlip && fortuneSlip.count >= 1) {
      user.items = user.items.filter((item) => item.itemId !== "3006");
      message.channel.send("Woooo! you have a good luck today");
      rewards.mora *= 2;
      rewards.primogems *= 2;
      const username = message.author.username;
      const experienceGained = 100; // Replace with the actual experience gained
      await updateARRank(message, username, experienceGained, message.channel);
      treasureMap.count--;
      fortuneSlip.count--;
    } else {
      treasureMap.count--;
    }
    
    // Add rewards to the user's currency
    user.mora += rewards.mora;
    user.primogems += rewards.primogems;
    const username = message.author.username;
    const experienceGained = 100; // Replace with the actual experience gained
    await updateARRank(message, username, experienceGained, message.channel);
// Remove the treasure map if the count is zero
if (treasureMap.count <= 0) {
  user.items = user.items.filter((item) => item.itemId !== "3003");
}
if (fortuneSlip && fortuneSlip.count <= 0) {
  user.items = user.items.filter((item) => item.itemId !== "3006");
}
// Save the updated user data after removing the treasure map
await user.save();

    // Edit the finding treasure message to display the results
    findingTreasureEmbed
      .setTitle("Treasure Found!")
      .setDescription("You used a Treasure map and got")
      .addFields(
        {
          name: "Primogems:",
          value: `${emojis.primogemIcon} ${rewards.primogems}`,
          inline: true,
        },
        {
          name: "Mora:",
          value: `${emojis.moraIcon}  ${rewards.mora}`,
          inline: true,
        },
        {
          name: "EXP:",
          value: `${emojis.xpIcon} ${experienceGained}`,
          inline: false,
        }
      )
      .setImage(chestImg)
      .setColor("Blurple");

    findingTreasureMessage.edit({
      embeds: [findingTreasureEmbed],
    });

    // Helper function to generate random rewards
    function generateRandomRewards() {
      // Define the rewards and their probabilities here
      const rewards = {
        mora: Math.floor(Math.random() * 1000),
        primogems: Math.floor(Math.random() * 10),
      };

      return rewards;
    }
  },
};
