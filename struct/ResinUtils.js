// struct/ResinUtils.js
const User = require("./../schemas/currencySchema");

async function regenerateResin(user) {
  if (!user) {
    console.log("User not registered. Skipping resin regeneration.");
    return;
  }

  const maxResin = 160;
  const resinPerMinute = 1;
  const currentTime = Date.now();
  const timeDifference = currentTime - (user.resinTimestamp || 0);
  const regeneratedResin = Math.floor(
    timeDifference / (1000 * 60 * resinPerMinute)
  );

  if (!user.resin) {
    user.resin = 0;
  }

  user.resin = Math.min(user.resin + regeneratedResin, maxResin);
  user.resinTimestamp = currentTime;

  await user.save();
}

// Function to handle resin regeneration for all users
async function regenerateAllResin() {
  try {
    const users = await User.find();
    for (const user of users) {
      await regenerateResin(user);
    }
    // console.log("Resin regeneration completed for all users.");
  } catch (error) {
    console.error("Error during resin regeneration:", error);
  }
}

module.exports = {
  regenerateResin,
  regenerateAllResin,
};
