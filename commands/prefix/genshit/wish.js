const fs = require("fs");
const User = require("./../../../schemas/currencySchema");
const characterData = require("./../../../Wishjsons/characters.json");
const { EmbedBuilder } = require("discord.js");
const GuildSettings = require("./../../../schemas/GuildSchema");
const weaponData = require("./../../../Wishjsons/weapons.json");
const itemsData = require("./../../../Wishjsons/items.json");
module.exports = {
  config: {
    name: "wish",
    description: "Make a wish and get a random character",
    usage: "wish",
    cooldown: 10,
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    try {
      //check if the channel we are in is the wish channel
      let guildSettings = await GuildSettings.findOne({
        guildId: message.guild.id,
      });
      if (!guildSettings) {
        guildSettings = new GuildSettings({ guildId: message.guild.id });
      }
      const wishChannel = guildSettings.wishChannel;
      if (!wishChannel.includes(message.channel.id)) {
        message.channel.send(
          "You can't use this command here, please go to the wish channel"
        );
        return;
      }

      // Load the data for characters and weapons
      const characters = characterData.characters;
      const weapons = weaponData.weapons;
      const characterCount = characters.length;
      const weaponCount = weapons.length;
      const items = itemsData.items;
      const itemCount = items.length;
      const totalItemCount = characterCount + weaponCount + itemCount;
      // Check if the user has enough primogems
      const primogemsNeeded = 160;
      let user = await User.findOne({ username: message.author.username });

      if (!user || user.primogems < primogemsNeeded) {
        return message.reply("You don't have enough primogems to make a wish.");
      }

      // Deduct primogems from the user's balance
      user.primogems -= primogemsNeeded;
      await user.save();
      // Simulate the wish and get a random character or weapon
      // Define the chances for each rarity
      const fiveStarChance = 0.006; // 0.6%
      const fourStarChance = 0.051; // 5.1%
      const threeStarChance = 1 - (fiveStarChance + fourStarChance); // Remaining for 3-star
      // Check the pity count for 4-star and 5-star
      let pity4Star = user.pity4Star || 0;
      let pity5Star = user.pity5Star || 0;
      const randomRarity = Math.random();

      let obtainedItem;
      // Increase the total wishes made

      if (randomRarity < fiveStarChance) {
        // Obtained a 5-star item
        obtainedItem = getRandom5StarItem();
      } else if (randomRarity < fiveStarChance + fourStarChance) {
        // Obtained a 4-star item
        obtainedItem = getRandom4StarItem();
        pity4Star = 0;
        pity5Star += 1; // Increase the 5-star pity for 4-star items
      } else {
        // Obtained a 3-star item
        pity4Star += 1;
        pity5Star += 1;
        obtainedItem = getRandom3StarItem();
      }
      user.wishesMade += 1;

      // Update the pity counters based on the obtained rarity
      if (obtainedItem.rarity === 4) {
        pity4Star += 1;
        pity5Star += 1; // Increase the 5-star pity for 4-star items
      } else if (obtainedItem.rarity === 5) {
        pity5Star = 0; // Reset the 5-star pity counter
      }

      // Check if the user reached the pity for a guaranteed 4-star item
      if (pity4Star >= 10) {
        obtainedItem = getRandom4StarItem(); // Force a 4-star item
        pity4Star = 0; // Reset the pity counter
      }

      // Check if the user reached the pity for a guaranteed 5-star item
      if (pity5Star >= 80) {
        obtainedItem = getRandom5StarItem(); // Force a 5-star item
        pity5Star = 0; // Reset the pity counter
      }
      // Define functions to get random items of each rarity
      function getRandom5StarItem() {
        const fiveStarCharacters = characters.filter(
          (character) => character.rarity === 5
        );
        const fiveStarWeapons = weapons.filter((weapon) => weapon.rarity === 5);
        const randomIndex = Math.floor(
          Math.random() * (fiveStarCharacters.length + fiveStarWeapons.length)
        );
        return randomIndex < fiveStarCharacters.length
          ? fiveStarCharacters[randomIndex]
          : fiveStarWeapons[randomIndex - fiveStarCharacters.length];
      }

      function getRandom4StarItem() {
        const fourStarCharacters = characters.filter(
          (character) => character.rarity === 4
        );
        const fourStarWeapons = weapons.filter((weapon) => weapon.rarity === 4);
        const randomIndex = Math.floor(
          Math.random() * (fourStarCharacters.length + fourStarWeapons.length)
        );
        return randomIndex < fourStarCharacters.length
          ? fourStarCharacters[randomIndex]
          : fourStarWeapons[randomIndex - fourStarCharacters.length];
      }

      function getRandom3StarItem() {
        const threeStarWeapons = weapons.filter(
          (weapon) => weapon.rarity === 3
        );
        const threeStarItems = items.filter((item) => item.rarity === 3);
        const randomIndex = Math.floor(
          Math.random() * (threeStarItems.length + threeStarWeapons.length)
        );
        return randomIndex < threeStarWeapons.length
          ? threeStarWeapons[randomIndex]
          : threeStarItems[randomIndex - threeStarWeapons.length];
      }
      // Save the updated pity counters
      user.pity4Star = pity4Star;
      user.pity5Star = pity5Star;
      // Show the wish GIF
      const wishGif =
        "https://upload-os-bbs.hoyolab.com/upload/2020/03/27/5789515/46aa55bc939a2c3632d2eec683184fec_2412966685494962307.gif";
      const gifEmbed = new EmbedBuilder()
        .setTitle("Wish Result")
        .setDescription(
          "A blade embraces its duty as a jeweler cherishes their gems."
        )
        .setImage(wishGif);
      const gifMessage = await message.channel.send({ embeds: [gifEmbed] });

      // Delayed display of character's image
      setTimeout(async () => {
        // Show the obtained character or weapon
        const itemEmbed = new EmbedBuilder()
          .setTitle(obtainedItem.name)
          .setDescription(
            `Rarity: ${obtainedItem.rarity} stars \n Type:  ${
              obtainedItem.weapon || obtainedItem.type
            }`
          )
          .setColor("Random")
          .setImage(obtainedItem.image);
        // Add stats for characters
        if (obtainedItem.stats) {
          itemEmbed.addFields({
            name: "Stats",
            value: `HP: ${obtainedItem.stats.hp}, ATK: ${obtainedItem.stats.atk}`,
            inline: true,
          });
        }

        await gifMessage.edit({ embeds: [itemEmbed] });

        // Check if the obtained item is a character or a weapon
        if (characters.some((character) => character.id === obtainedItem.id)) {
          // Obtained a character
          const existingCharacter = user.characters.find(
            (c) => c.characterId === obtainedItem.id
          );
          if (existingCharacter) {
            // Increment the count if the character already exists
            existingCharacter.count += 1;
            const constellationLimit = 3;
            if (existingCharacter.constellation < constellationLimit) {
              existingCharacter.constellation += 1;
            } else {
              message.channel.send(
                "It looks like you have reached the constellation Limit for this character, CONGO!! "
              );
              user.primogems += 100;
              message.channel.send("you got 100 primogems");
            }
          } else {
            // Add a new entry if the character is not already in the inventory
            user.characters.push({
              characterId: obtainedItem.id,
              name: obtainedItem.name,
              hp: obtainedItem.stats.hp,
              atk: obtainedItem.stats.atk,
              def: obtainedItem.stats.def,
              critRate: obtainedItem.stats.critRate,
              critDmg: obtainedItem.stats.critDmg,
              rarity: obtainedItem.rarity,
              count: 1,
              activeConstellation: obtainedItem.stats.activeConstellation,
            });
          }
        } else if (weapons.some((weapon) => weapon.id === obtainedItem.id)) {
          // Obtained a weapon
          const existingWeapon = user.weapons.find(
            (w) => w.weaponId === obtainedItem.id
          );
          if (existingWeapon) {
            // Increment the count if the weapon already exists
            existingWeapon.count += 1;
            const RefineLimit = 3;
            if (existingWeapon.refinement < RefineLimit) {
              existingWeapon.refinement += 1;
            } else {
              message.channel.send(
                "It looks like you have reached the RefineMent Limit for this weapon, CONGO!! "
              );
              user.primogems += 100;
              message.channel.send("you got 100 primogems");
            }
          } else {
            // Add a new entry if the weapon is not already in the inventory
            user.weapons.push({
              weaponId: obtainedItem.id,
              name: obtainedItem.name,
              hp: obtainedItem.stats.hp,
              atk: obtainedItem.stats.atk,
              def: obtainedItem.stats.def,
              critRate: obtainedItem.stats.critRate,
              critDmg: obtainedItem.stats.critDmg,
              rarity: obtainedItem.rarity,
              count: 1,
              activeRefinement: obtainedItem.stats.activeRefinement,
            });
          }
        } else if (items.some((item) => item.id === obtainedItem.id)) {
          // Obtained a item
          const existingItem = user.items.find(
            (i) => i.itemId === obtainedItem.id
          );
          if (existingItem) {
            // Increment the count if the item already exists
            existingItem.count += 1;
          } else {
            // Add a new entry if the item is not already in the inventory
            user.items.push({
              itemId: obtainedItem.id,
              itemName: obtainedItem.name,
              count: 1,
            });
          }
        }
        await user.save();
      }, 5000);
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred while making a wish.");
    }
  },
};
