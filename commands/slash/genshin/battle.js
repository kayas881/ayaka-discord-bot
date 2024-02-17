const { SlashCommandBuilder } = require("discord.js");
const bossesData = require("./../../../genshinJsons/bosses.json");
const User = require("./../../../schemas/currencySchema");
const { simulateBattle } = require("./../../../struct/battleUtils.js");
const { EmbedBuilder } = require("discord.js");
const superagent = require("superagent");
const itemData = require("./../../../Wishjsons/items.json")
const {
  calculateExperienceGained,
  updateARRank,
  activityExperience,
} = require("./../../../struct/slashLogic.js");

module.exports = {
  name: "battle",
  description: "Start a battle simulation against a boss",
  type: 1,
  options: [
    {
      name: "boss",
      description: "Select the boss you want to fight",
      type: 3,
      required: true,
      choices: bossesData.bosses.map((boss) => ({
        name: boss.name,
        value: boss.name,
      })),
    },
  ],
  cooldown: 20,
  permissions: {
    DEFAULT_MEMBER_PERMISSIONS: ["SendMessages"],
  },
  category: "modals",
  run: async (client, interaction, message, config, db) => {
    const resultEmbed = new EmbedBuilder(); // Define resultEmbed here
    const bossName = interaction.options.getString("boss");
    const boss = bossesData.bosses.find((boss) => boss.name === bossName);
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/pat/gif`
    );
    if (!boss) {
      await interaction.reply("Invalid boss selection.");
      return;
    }
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId }); // Use 'username' instead of 'id'

    if (!user) {
      await interaction.reply(
        "You need to use the wish command to obtain characters and weapons first."
      );
      return;
    }
    const resinCost = 20;

    // Check if the user has enough resin
    if (user.resin < resinCost) {
      await interaction.reply(
        `Insufficient resin. You need at least ${resinCost} resin to participate in the battle.`
      );
      return;
    }
    const cooldownTime = 60 * 1000;
    const currentTime = Date.now();
    if (
      user.lastBattleTime &&
      currentTime - user.lastBattleTime < cooldownTime
    ) {
      await interaction.reply(
        `You are on cooldown. Please wait ${
          (cooldownTime - (currentTime - user.lastBattleTime)) / 1000
        } seconds and try again.`
      );
      return;
    }
    // Deduct resin cost
    user.resin -= resinCost;
    // Calculate experience gained from the battle

    user.lastBattleTime = currentTime;
    await user.save();

    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("Battle Simulation")
      .setDescription("Preparing for battle... Please wait.");

    const loadingMessage = await interaction.reply({
      embeds: [loadingEmbed],
    });

    const { battleResult } = await simulateBattle(user, boss, async (log) => {
      // Update the embed with the latest battle log
      const battleProgressEmbed = new EmbedBuilder()
        .setColor("#00FF00") // You can set the color accordingly
        .setTitle("Battle Progress")
        .setDescription("```" + log + "```")
        .setImage(boss.image);

      await loadingMessage.edit({
        embeds: [battleProgressEmbed],
      });
    });
    let itemDrop = null;

    // Handle the case when the user wins
    if (battleResult === "victory") {
      // Generate random amounts of primogems and mora
      // const primogemsReward = Math.floor(Math.random() * (50 - 20 + 1) + 20);
      // const moraReward = Math.floor(Math.random() * (1000 - 500 + 1) + 500);
      const primogemsReward = Math.floor(Math.random() * (boss.rewards.primo_min - boss.rewards.primo_max + 1) + boss.rewards.primo_max);
      const moraReward = Math.floor(Math.random() * (boss.rewards.mora_min - boss.rewards.mora_max + 1) + boss.rewards.mora_max);


      // Update the user's currency
      user.primogems += primogemsReward;
      user.mora += moraReward;


     // Check if the boss drops an item

if (boss.drops.items.length > 0) {
  const drop = boss.drops.items[0]; // Assuming there's only one item in the array
  if (Math.random() <= drop.chance) {
    itemDrop = drop.id; // The boss drops the item

    // Get the item details from the itemData
    const item = itemData.items.find((i) => i.id === itemDrop);

    // Check if the item already exists in the user's inventory
    let itemExists = false;
    for (let i = 0; i < user.items.length; i++) {
      if (user.items[i].itemId === item.id) {
        user.items[i].count += 1;
        itemExists = true;
        break;
      }
    }

    // If the item doesn't exist in the user's inventory, add it
    if (!itemExists) {
      user.items.push({
        itemName: item.name,
        itemId: item.id,
        count: 1,
      });
    }
  }
}
      // Save the updated user data
      await user.save();

  // Save the updated user data
  await user.save();
      // Save the updated user data
      await user.save();

      // Add reward details to the result embed
      resultEmbed
        .setColor("#00FF00") // Set the color for the victory
        .setTitle("Congratulations!")
        .setDescription("You have defeated the boss!, You got:")
        .addFields(
          {
            name: "Primogems:",
            value: `<:Primogem:1098674584825376829> ${primogemsReward}`,
            inline: true,
          },
          {
            name: "Mora:",
            value: `<:Mora:1098674469364580363> ${moraReward}`,
            inline: true,
          },
        
        );
        if (itemDrop) {
          
          const item = boss.drops.items.find((i) => i.id === itemDrop);
          const itemName = itemData.items.find((i) => i.id === itemDrop).name;
          resultEmbed.addFields({name:"Item Drop",value: `${itemName}`, inline: true});
        }
    } else
      resultEmbed
        .setTitle(`Aya pats ${interaction.user.username}`)
        .setColor(0xf000ff)
        .setDescription("You were defeated by the boss. Better luck next time!")
        .setImage(body.link)
        .setTimestamp();
      
    // Edit the loading message with the final result
    await loadingMessage.edit({
      embeds: [resultEmbed],
    });
  },
};
