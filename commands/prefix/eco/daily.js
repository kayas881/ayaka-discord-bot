const User = require("./../../../schemas/currencySchema");
const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  calculateExperienceGained,
} = require("./../../../struct/xputills"); // Import the calculateExperienceGained function
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  config: {
    name: "daily",
    description: "Claim your daily rewards",
    usage: "daily",
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const user = await User.findOne({ username: message.author.username });
    // const primogemIcon = "<:Primogem:1098674584825376829>";
    // const moraIcon = "<:Mora:1098674469364580363>";
    // const xpIcon = "<:Item_Adventure_EXP:1175741402462818355>";
    // const resinIcon = "<:FragileResin:1098674371612114974>";
    if (!user) {
      message.reply(
        "You are not registered in the database. Use the !register command to register."
      );
      return;
    }

    // Check if the user has already claimed their daily rewards today
    const now = Date.now();
    const lastDailyClaim = user.lastDailyClaim || 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours cooldown in milliseconds

    if (now - lastDailyClaim < cooldown) {
      message.reply(
        "You have already claimed your daily rewards today. Try again later."
      );
      return;
    }

    // Award daily rewards
    user.mora += 100;
    user.primogems += 100;
    user.lastDailyClaim = now;

    // Calculate the daily experience points earned by the user using the updated function
    const username = message.author.username;
    const experienceGained = 100; // Replace with the actual experience gained
    await updateARRank(message, username, experienceGained, message.channel);
    // Save the user's data with the updated experience and rank
    await user.save();

    message.reply(
      `You have successfully claimed your daily rewards: +100 ${emojis.xpIcon}, +100 ${emojis.moraIcon}, +100 ${emojis.primogemIcon}`
    );
  },
};
