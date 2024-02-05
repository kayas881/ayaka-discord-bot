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
    name: "weekly",
    description: "Claim your weekly rewards",
    usage: "weekly",
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const user = await User.findOne({ username: message.author.username });

    if (!user) {
      message.reply(
        "You are not registered in the database. Use the !register command to register."
      );
      return;
    }

    // Check if the user has already claimed their daily rewards today
    const now = Date.now();
    const lastWeeklyClaim = user.lastWeeklyClaim;
    const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown in milliseconds

    if (now - lastWeeklyClaim < cooldown) {
      message.reply(
        "You have already claimed your daily rewards today. Try again later."
      );
      return;
    }

    const moraReward = 5000;
    const primogemsReward = 500;

    // Award daily rewards
    user.mora += moraReward;
    user.primogems += primogemsReward;
    user.lastWeeklyClaim = now;

    // Calculate the daily experience points earned by the user using the updated function
    const username = message.author.username;
    const experienceGained = 700; // Replace with the actual experience gained
    await updateARRank(message, username, experienceGained, message.channel);
    // Save the user's data with the updated experience and rank
    await user.save();

    message.reply(
      `You have successfully claimed your weekly rewards: ${experienceGained} ${emojis.xpIcon}, ${emojis.moraIcon} ${moraReward}, ${emojis.primogemIcon} ${primogemsReward}`
    );
  },
};
