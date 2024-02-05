const mongoose = require("mongoose");
const User = require("./../schemas/currencySchema"); // Import your User model
const fs = require("fs");

const Canvas = require("canvas");
const Discord = require("discord.js");
const { AttachmentBuilder } = require("discord.js");

async function saveUserProfileImage(userId, imageBuffer) {
  const filename = `profile_${userId}.png`;
  const imagePath = `./../images/${filename}`;
  console.log("Image Path:", imagePath);

  try {
    // Use the asynchronous version of file writing
    await fs.promises.writeFile(imagePath, imageBuffer);
    // Update the profileImage field in the database
    await User.findOneAndUpdate(
      { username: userId },
      { profileImage: imagePath }
    );
    console.log("Profile image saved successfully.");
  } catch (error) {
    console.error("Error saving profile image:", error);
  }
}

// Update the user's profile and image when data changes
async function updateUserProfile(userId, updatedData, newImageBuffer) {
  // Update user's data in the database
  await User.findOneAndUpdate({ username: userId }, updatedData);

  if (newImageBuffer) {
    // Check if the image exists already
    const existingUser = await User.findOne({ username: userId });

    if (existingUser && existingUser.profileImage) {
      // Delete the existing image before saving the new one
      fs.unlink(existingUser.profileImage, async (err) => {
        if (err) {
          console.error("Error deleting existing profile image:", err);
        } else {
          console.log("Existing profile image deleted.");
          // Save the new image
          await saveUserProfileImage(userId, newImageBuffer);
        }
      });
    } else {
      // If no existing image found, simply save the new image
      await saveUserProfileImage(userId, newImageBuffer);
    }
  }
}

// Sending the saved image to Discord
async function sendUserProfileImage(message, userId, buffer) {
  User.findOne({ username: userId }, async (err, user) => {
    if (err) {
      // Handle any errors
    }

    if (user && user.profileImage) {
      const imageStream = fs.createReadStream(user.profileImage);
      const attachment = new AttachmentBuilder(imageStream, "balance.png");
      message.channel.send({ files: [attachment] });
    } else {
      const attachment = new AttachmentBuilder(buffer, "balance.png");
      message.channel.send({ files: [attachment] });
    }
  });
}

module.exports = {
  sendUserProfileImage,
  updateUserProfile,
  saveUserProfileImage,
};
