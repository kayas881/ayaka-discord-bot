// const fs = require('fs');
// const User = require('./../../../schemas/currencySchema');
// const characterData = require('./../../../characters.json');
// const { EmbedBuilder } = require('discord.js');
// const Wish = require('./../../../schemas/wishSchema');
// const cooldowns = new Map();
// const weaponData = require('./../../../weapons.json')

// module.exports = {
//   config: {
//     name: "equip",
//     description: "Equip a character and a weapon to boost your total HP and ATK",
//     usage: "equip <character_name> <weapon_name>",
//   },
//   permissions: ['SendMessages'],
//   owner: false,
//   run: async (client, message, args, prefix, config, db, interaction) => {
//     const user = await User.findOne({ id: message.author.id });
//     if (!user) {
//       return message.reply("You need to use the wish command to obtain characters and weapons first.");
//     }

//     const characterName = args[0];
//     const weaponName = args[1];

//     if (!characterName || !weaponName) {
//       return message.reply("Please provide both a character name and a weapon name to equip.");
//     }

//     // Search for the character and weapon by their names
//     const character = characterData.characters.find(c => c.name.toLowerCase() === characterName.toLowerCase());
//     const weapon = weaponData.weapons.find(w => w.name.toLowerCase() === weaponName.toLowerCase());

//     if (!character || !weapon) {
//       return message.reply("Invalid character or weapon name. Please check your names and try again.");
//     }

//     // Check if the user owns the character and weapon
//     const ownsCharacter = user.characters.some(c => c.characterId === character.id);
//     const ownsWeapon = user.weapons.some(w => w.weaponId === weapon.id);

//     if (!ownsCharacter || !ownsWeapon) {
//       return message.reply("You don't own the specified character or weapon.");
//     }

//     // Equip the character and weapon
//     user.equippedCharacter = character.id;
//     user.equippedWeapon = weapon.id;
//     await user.save();

//     // Calculate total HP and ATK
//     const equippedCharacter = user.characters.find(c => c.characterId === character.id);
//     const equippedWeapon = user.weapons.find(w => w.weaponId === weapon.id);

//     const totalHP = equippedCharacter.hp + equippedWeapon.atk;
//     const totalATK = equippedCharacter.atk + equippedWeapon.atk;

//     user.totalHP = totalHP;
//     user.totalATK = totalATK;
//     await user.save();

//     // Send a confirmation message
//     message.channel.send(`You have equipped ${character.name} with ${weapon.name}. Your total HP is now ${totalHP} and your total ATK is now ${totalATK}.`);
//   }
// };
