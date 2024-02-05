const Canvas = require("canvas");
const Discord = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const { AttachmentBuilder } = require("discord.js");
const { registerFont } = require("canvas");
const weaponData = require("./../../../Wishjsons/weapons.json");
const characterData = require("./../../../Wishjsons/characters.json");
const path = require('path');

const blockHeadFontPath = path.resolve(__dirname, './../../../BlockHead_bold.ttf');
const franchiseFreeFontPath = path.resolve(__dirname, './../../../Franchise-Free-Bold.ttf');
const mangoldFontPath = path.resolve(__dirname, './../../../MANGOLD.ttf');

registerFont(blockHeadFontPath, { family: 'BlockHead' });
registerFont(franchiseFreeFontPath, { family: 'Franchise Free' });
registerFont(mangoldFontPath, { family: 'MANGOLD' });


module.exports = {
  config: {
    name: "balance",
    description: "Shows Your Aya  profile",
    usage: "balance",
    cooldown: 20,
  },
  Permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args) => {
    let user = await User.findOne({ username: message.author.username });
    if (!user) {
      message.reply(
        "You are not registered in the database. Use the !register command to get started!"
      );
      return;
    }
    // Show a loading message with a GIF
    const loadingMessage = await message.reply(
      "https://upload-os-bbs.hoyolab.com/upload/2020/03/27/5789515/46aa55bc939a2c3632d2eec683184fec_2412966685494962307.gif"
    );

    const totalHP = user.totalHP;
    const totalATK = user.totalATK;
    const equippedCharacterName =
      user.equippedCharacter.length > 0
        ? user.equippedCharacter[0].name
        : "No equipped character";

    const equippedWeaponName =
      user.equippedWeapon.length > 0
        ? user.equippedWeapon[0].name
        : "no equipped weapon";

    const fontFamily = "BlockHead";
    const fontSize = 48;
    const titleFontFamily = "Franchise Free";
    const statsFontFamily = "MANGOLD";
    const userColor = user.equippedColor;
    const canvas = Canvas.createCanvas(1080, 566);
    const ctx = canvas.getContext("2d");

    const [background, profilePic, moraIcon, primogemIcon, resinIcon] =
      await Promise.all([
        Canvas.loadImage(user.equippedBanner),
        Canvas.loadImage(message.author.displayAvatarURL({ extension: "jpg" })),
        Canvas.loadImage(
          "https://static.wikia.nocookie.net/gensin-impact/images/8/84/Item_Mora.png/revision/latest/thumbnail/width/360/height/360?cb=20210106073715"
        ),
        Canvas.loadImage(
          "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest?cb=20201117071158"
        ),
        Canvas.loadImage(
          "https://static.wikia.nocookie.net/gensin-impact/images/3/35/Item_Fragile_Resin.png/revision/latest?cb=20210106074218"
        ),
      ]);

    // const background = await Canvas.loadImage(user.equippedBanner);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = `50px ${titleFontFamily}`;
    ctx.fillStyle = `${userColor}`;
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;
    // In your balance command
    ctx.fillText(user.username + "'s Aya Profile", 200, 50); // Use user.username instead of message.author.username
    ctx.strokeText(user.username + "'s Aya Profile", 200, 50); // Use user.username instead of message.author.username
    // In your balance command
    ctx.fillText(user.username + "'s Aya Profile", 200, 50); // Use user.username instead of message.author.username
    ctx.strokeText(user.username + "'s Aya Profile", 200, 50); // Use user.username instead of message.author.username

    ctx.font = `38px ${statsFontFamily}`;

    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;

    ctx.fillText(`Adventure Rank: ${user.rank}`, 200, 100);
    ctx.strokeText(`Adventure Rank: ${user.rank}`, 200, 100);

    ctx.fillText(`${user.rankName}`, 200, 150);
    ctx.strokeText(`${user.rankName}`, 200, 150);

    // const profilePic = await Canvas.loadImage(user.equippedProfilePic);
    const picSize = 160;
    const picX = 20;
    const picY = 20;
    const picRadius = picSize / 2;
    const picClipX = picX + picRadius;
    const picClipY = picY + picRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(picClipX, picClipY, picRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;
    ctx.drawImage(profilePic, picX, picY, picSize, picSize);
    ctx.restore();

    // Draw icons and text for Mora, Primogems, and Resin
    const iconSize = 40;
    const iconY = 3;
    const textY = 35;

    ctx.drawImage(moraIcon, 610, iconY, iconSize, iconSize);
    ctx.font = `30px ${statsFontFamily}`;
    ctx.fillText(`${user.mora} `, 650, textY);
    ctx.strokeText(`${user.mora} `, 650, textY);

    ctx.drawImage(primogemIcon, 750, iconY, iconSize, iconSize);
    ctx.font = `30px ${statsFontFamily}`;
    ctx.fillText(`${user.primogems} `, 790, textY);
    ctx.strokeText(`${user.primogems} `, 790, textY);

    ctx.drawImage(resinIcon, 890, iconY, iconSize, iconSize);
    ctx.font = `30px ${statsFontFamily}`;
    ctx.fillText(`${user.resin}/160`, 930, textY);
    ctx.strokeText(`${user.resin}/160`, 930, textY);
    // Draw Bio, Total HP, and Total ATK
    ctx.font = `38px ${statsFontFamily}`;

    ctx.fillText(`Wishes made: ${user.wishesMade}`, 50, 240);
    ctx.strokeText(`Wishes made: ${user.wishesMade}`, 50, 240);

    ctx.fillText(`HP: ${totalHP}`, 50, 290);
    ctx.strokeText(`HP: ${totalHP}`, 50, 290);

    ctx.fillText(`ATK: ${totalATK}`, 50, 340);
    ctx.strokeText(`ATK: ${totalATK}`, 50, 340);

    ctx.fillText(`Bio: ${user.bio}`, 50, 390);
    ctx.strokeText(`Bio: ${user.bio}`, 50, 390);

    ctx.fillText(`Equipped Character: ${equippedCharacterName}`, 50, 440);
    ctx.strokeText(`Equipped Character: ${equippedCharacterName}`, 50, 440);
    ctx.fillText(`Equipped Weapon: ${equippedWeaponName}`, 50, 490);
    ctx.strokeText(`Equipped Weapon: ${equippedWeaponName}`, 50, 490);

    // Send the canvas as an attachment
    const buffer = canvas.toBuffer();
    const attachment = new AttachmentBuilder(buffer, "balance.png");
    loadingMessage.delete();
    message.channel.send({
      files: [attachment],
    });
  },
};
