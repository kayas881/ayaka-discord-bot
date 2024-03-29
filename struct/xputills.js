const mongoose = require("mongoose");
const User = require("./../schemas/currencySchema"); // Import your User model
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
// Define the AR level names and thresholds
const arLevelNames = {
  0: "NPC",
  5: "Traveler",
  10: "Adventurer",
  15: "Allogene",
  25: "Abyss order",
  35: "Archon",
  45: "Celestial Being",
  55: "Descender",
  60: "The heavenly principle",
};

const arLevelThresholds = [
  { level: 1, expNeeded: 0 },
  { level: 2, expNeeded: 100 },
  { level: 3, expNeeded: 400 },
  { level: 4, expNeeded: 500 },
  { level: 5, expNeeded: 525 },
  { level: 6, expNeeded: 650 },
  { level: 7, expNeeded: 750 },
  { level: 8, expNeeded: 875 },
  { level: 9, expNeeded: 1100 },
  { level: 10, expNeeded: 1300 },
  { level: 11, expNeeded: 1425 },
  { level: 12, expNeeded: 1525 },
  { level: 13, expNeeded: 1650 },
  { level: 14, expNeeded: 1775 },
  { level: 15, expNeeded: 1875 },
  { level: 16, expNeeded: 2000 },
  { level: 17, expNeeded: 2375 },
  { level: 18, expNeeded: 2500 },
  { level: 19, expNeeded: 2675 },
  { level: 20, expNeeded: 2775 },
  { level: 21, expNeeded: 3025 },
  { level: 22, expNeeded: 3425 },
  { level: 23, expNeeded: 3725 },
  { level: 24, expNeeded: 4000 },
  { level: 25, expNeeded: 4300 },
  { level: 26, expNeeded: 4575 },
  { level: 27, expNeeded: 4875 },
  { level: 28, expNeeded: 5150 },
  { level: 29, expNeeded: 5450 },
  { level: 30, expNeeded: 5750 },
  { level: 31, expNeeded: 6025 },
  { level: 32, expNeeded: 6300 },
  { level: 33, expNeeded: 6600 },
  { level: 34, expNeeded: 6900 },
  { level: 35, expNeeded: 7125 },
  { level: 36, expNeeded: 7425 },
  { level: 37, expNeeded: 7750 },
  { level: 38, expNeeded: 8050 },
  { level: 39, expNeeded: 8350 },
  { level: 40, expNeeded: 8625 },
  { level: 41, expNeeded: 10550 },
  { level: 42, expNeeded: 11525 },
  { level: 43, expNeeded: 12450 },
  { level: 44, expNeeded: 13450 },
  { level: 45, expNeeded: 14450 },
  { level: 46, expNeeded: 15350 },
  { level: 47, expNeeded: 16550 },
  { level: 48, expNeeded: 17250 },
  { level: 49, expNeeded: 18250 },
  { level: 50, expNeeded: 19200 },
  { level: 51, expNeeded: 26400 },
  { level: 52, expNeeded: 28800 },
  { level: 53, expNeeded: 31200 },
  { level: 54, expNeeded: 33600 },
  { level: 55, expNeeded: 36000 },
  { level: 56, expNeeded: 232000 },
  { level: 57, expNeeded: 258950 },
  { level: 58, expNeeded: 285750 },
  { level: 59, expNeeded: 312825 },
  { level: 60, expNeeded: 340125 },
];

function getARLevelName(rank) {
  for (let i = rank; i >= 0; i--) {
    if (arLevelNames[i]) {
      return arLevelNames[i];
    }
  }
  return arLevelNames[0]; // Return the lowest rank if no match is found
}

// Function to get the EXP needed to level up
function getXPToLevelUp(rank, experience) {
  const nextLevelThreshold = arLevelThresholds.find(
    (threshold) => threshold.level === rank + 1
  );
  if (!nextLevelThreshold) {
    return null; // User is already at max level
  }
  // Calculate the remaining experience needed to level up
  return Math.max(nextLevelThreshold.expNeeded - experience, 0);
}

// Function to update user's AR rank based on experience gained
// Function to update user's AR rank based on experience gained
async function updateARRank(message, userId, experienceGained, channel) {
  try {
    let user = await User.findOne({ userId: userId });

    if (!user) {
      console.log(`User with ID ${user} not found.`);
      return;
    }

    let currentRank = user.rank;
    let totalExperience = user.experience + experienceGained;

    // Check if the user has reached the max level
    if (currentRank >= arLevelThresholds.length) {
      console.log("User is already at max level.");
      return;
    }

    // Continue leveling up until there's not enough experience
    while (totalExperience >= arLevelThresholds[currentRank].expNeeded) {
      totalExperience -= arLevelThresholds[currentRank].expNeeded;
      const newRank = currentRank + 1;

      if (newRank >= arLevelThresholds.length) {
        // Reached max level, break the loop
        break;
      }

      // Check if the new rank has a name
      const rankName = arLevelNames[newRank];
      let congratulatoryMessage = `Congratulations ${message.author.username}! You have reached AR ${newRank}`;

      // Check if there are rewards for reaching the new rank

      // Check if there are rewards for reaching the new rank
      const rankRewards = getRankRewards(newRank);
      if (Object.keys(rankRewards).length > 0) {
        congratulatoryMessage += `\nRewards: ${Object.entries(rankRewards)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}`;
        // Grant the rewards to the user (you need to implement this function)
        await grantRewardsToUser(user, rankRewards);
      }

      if (rankName) {
        congratulatoryMessage += ` and you are now a ${rankName}`;
      }

      // Send congratulatory message to the Discord channel
      channel.send(congratulatoryMessage);

      currentRank = newRank;
    }

    // Update user's rank and remaining experience
    user.rank = currentRank;
    user.experience = totalExperience;
    user.rankName = getARLevelName(currentRank);

    await user.save(); // Save the updated user document
  } catch (error) {
    console.error("Error updating AR rank:", error);
  }
}

function getRankRewards(rank) {
  // Define rewards for each rank
  const rankRewards = {
    5: { primogems: 50, mora: 10000 },
    10: { primogems: 100, mora: 20000 },
    15: { primogems: 150, mora: 30000 },
    20: { primogems: 200, mora: 40000 },
    25: { primogems: 250, mora: 50000 },
    30: { primogems: 300, mora: 60000 },
    35: { primogems: 350, mora: 70000 },
    40: { primogems: 400, mora: 80000 },
    45: { primogems: 450, mora: 90000 },
    50: { primogems: 500, mora: 100000 },
    55: { primogems: 550, mora: 110000 },
    60: { primogems: 600, mora: 120000 },
  };

  return rankRewards[rank] || {};
}

// Function to grant rewards to the user
// Function to grant rewards to the user
async function grantRewardsToUser(user, rewards) {
  try {
    // Grant Primogems
    user.primogems += rewards.primogems;

    // Grant Mora
    user.mora += rewards.mora;

    // Save the updated user document
    await user.save();
  } catch (error) {
    console.error("Error granting rewards to user:", error);
  }
}

async function increaseExperience(user, xpAmount = 0) {
  let experienceGained = xpAmount;

  // Call the updateARRank function to handle rank update based on experience gained
  await updateARRank(user._id, experienceGained);

  return experienceGained;
}

module.exports = {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  increaseExperience, // Rename the function for clarity
};
