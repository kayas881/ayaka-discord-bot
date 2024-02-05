const Canvas = require("canvas");
const Discord = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const { AttachmentBuilder } = require("discord.js");
const { registerFont } = require("canvas");
const path = require("path");
const cheriPath = path.resolve(__dirname, "./../../../CHERI___.TTF");
registerFont(cheriPath, { family: "Cheri" });

module.exports = {
  config: {
    name: "lb",
    description: "Shows a leaderBoard based on Adventure Rank in the guild",
    usage: "leaderboard",
    cooldown: 20,
  },
  Permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args) => {
    // Show a loading message with a GIF
    const loadingMessage = await message.reply(
      "https://upload-os-bbs.hoyolab.com/upload/2020/03/27/5789515/46aa55bc939a2c3632d2eec683184fec_2412966685494962307.gif"
    );

    // Fetch the top 10 users based on adventure rank in the current guild
    let users = await User.find({
      guildId: message.guild.id,
    })
      .sort({ rank: -1 })
      .limit(10);

    // Filter out users that are not in the guild
    users = users.filter((user) =>
      message.guild.members.cache.has(user.userId)
    );
    let user = await User.findOne({
      username: message.author.username,
      guildId: message.guild.id,
    });
    const canvas = Canvas.createCanvas(1080, 566);
    const ctx = canvas.getContext("2d");
    const userFontFamily = "Lora SemiBold";
    const titleFontFamily = "Cheri";
    const userColor = user.equippedColor;
    // Load and draw the background image
    const backgroundImage = await Canvas.loadImage(
      "assets/Ayaka1.png"
    );
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Title
    // Title
    ctx.font = `bold 50px ${titleFontFamily}`;
    ctx.fillStyle = "#4ab1e0";
    ctx.shadowColor = "#3a5d6e";
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 4;
    ctx.fillText("Aya's Leaderboard", 50, 50);
    ctx.strokeText("Aya's Leaderboard", 50, 50);

    // User data
    let y = 100;
    let column = 0; // Track the current column (0 for left, 1 for right)

    const imageLoadingPromises = users.map(async (user, index) => {
      const discordUser = await client.users.fetch(user.userId); // Fetch the Discord user
      const avatarURL = discordUser.displayAvatarURL({
        extension: "jpg",
      });

      return {
        profilePic: await Canvas.loadImage(avatarURL),
        user,
        index,
      };
    });

    const loadedImages = await Promise.all(imageLoadingPromises);

    for (const { profilePic, user, index } of loadedImages) {
      // Calculate x position based on the column
      const x = column === 0 ? 30 : 450;

      // Draw round profile picture
      ctx.save(); // Save the current state of the context
      ctx.beginPath();
      ctx.arc(x + 25, y + 25, 25, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profilePic, x, y, 50, 50);
      ctx.restore();

      // Draw username
      ctx.font = "Extrabold 22px sans-serif";
      const maxUsernameLength = 10; // You can adjust this based on your design

      const truncatedUsername =
        user.username.length > maxUsernameLength
          ? user.username.substring(0, maxUsernameLength) + "..."
          : user.username;

   ctx.fillStyle = `${userColor}`;
      // ctx.fillStyle = "#e451f5";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 4;
      ctx.fillText(truncatedUsername, x + 60, y + 20);

      // Draw Adventure Rank
      ctx.fillText(`AR ${user.rank}`, x + 60, y + 40);

      // Draw Stats
      const totalATK = user.totalATK;
      const totalHP = user.totalHP;

      ctx.fillText(`ATK: ${totalATK} | HP: ${totalHP}`, x + 175, y + 30);

      // Move to the next row or column
      if (column === 0 && index === 4) {
        column = 1;
        y = 100; // Reset y for the right column
      } else {
        y += 90;
      }
    }

    // Send the image
    const buffer = canvas.toBuffer();
    const attachment = new AttachmentBuilder(buffer, "leaderboard.png");
    loadingMessage.delete();
    message.channel.send({
      files: [attachment],
    });
  },
};
