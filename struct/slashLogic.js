// Import required modules and schemas
const User = require("./../schemas/currencySchema");
const { updateARRank, activityExperience } = require("./../struct/xputills");
// Function to calculate experience gained for a specific activity
// Function to calculate experience gained for a specific activity
async function calculateExperienceGained(
  user,
  activity,
  activitySuccessful,
  xpAmount = 0 // Default to 0
) {
  let experienceGained = 0;

  // Check if the activity corresponds to a known activity
  if (activityExperience[activity] && activitySuccessful) {
    experienceGained += activityExperience[activity];
  }

  // Add additional XP amount (if provided)
  experienceGained += xpAmount;

  // Call the updateARRank function to handle rank update based on experience gained
  await updateARRank(user._id, experienceGained);

  return experienceGained;
}

module.exports = {
  calculateExperienceGained,
};
