const User = require("./../../../schemas/currencySchema");
const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  calculateExperienceGained,
} = require("./../../../struct/xputills"); // Import the calculateExperienceGained function
const emojis = require("./../../../utilitiesJsons/emojis.json");
const GuildSettings = require("./../../../schemas/GuildSchema");
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
    const guild = await GuildSettings.findOne({ guildId: message.guild.id });

    if (!user) {
      message.reply(
        `You are not registered in the database. Use the ${guild.prefix} register command to register.`
      );
      return;
    }

    // Check if the user has already claimed their daily rewards today
    const now = Date.now();
    const lastWeeklyClaim = user.lastWeeklyClaim;
    const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown in milliseconds
//check how much time is remaining to collect new weekly rewards
    const remainingTime = cooldown - (now - lastWeeklyClaim);
    const days = Math.floor(remainingTime / 86400000);
    const hours = Math.floor((remainingTime % 86400000) / 3600000);
    const minutes = Math.floor((remainingTime % 3600000) / 60000);
    if (now - lastWeeklyClaim < cooldown) {
      message.reply(
        `You have already claimed your weekly rewards. You can claim them again in ${days} days, ${hours} hours and ${minutes} minutes.`
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
