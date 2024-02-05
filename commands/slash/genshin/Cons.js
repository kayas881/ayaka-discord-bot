const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const User = require("../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const characterData = require("../../../Wishjsons/characters.json");
const { EmbedBuilder } = require("discord.js");
const charactersData = require("./../../../Wishjsons/characters.json");
const dictionary = require("./../../../dictionaries");
module.exports = {
  name: "constellation",
  description: "Equip constellation to boost your total HP and ATK",
  type: 1,
  options: [
    {
      name: "character",
      description: "The character to equip",
      type: 3, // String type
      required: true,
      autocomplete: true,
    },
  ],
  cooldown: 10,
  async autocomplete(interaction) {
    const sword = `${dictionary.weaponToEmoji.sword}`;
    const focusedOption = interaction.options.getFocused(true);
    let choices;
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId });
    //find the focused option in the charactersData array
    // const focusedCharacter = charactersData.characters.find(
    //   (character) => character.name === focusedOption.value
    // );
    // const focusedWeapon = focusedCharacter.weapon;
    // if (focusedWeapon === "sword") {
    //   let emoji = `${dictionary.weaponToEmoji.sword}`;
    // } else if (focusedWeapon === "claymore") {
    //   let emoji = `${dictionary.weaponToEmoji.claymore}`;
    // } else if (focusedWeapon === "polearm") {
    //   let emoji = `${dictionary.weaponToEmoji.polearm}`;
    // } else if (focusedWeapon === "catalyst") {
    //   let emoji = `${dictionary.weaponToEmoji.catalyst}`;
    // } else if (focusedWeapon === "bow") {
    //   let emoji = `${dictionary.weaponToEmoji.bow}`;
    // }

    if (focusedOption.name === "character") {
      choices = user.characters.map((character) => character.name);
    }
    const filtered = choices
      .filter((choice) => choice.toLowerCase().startsWith(focusedOption.value))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  permissions: {
    DEFAULT_MEMBER_PERMISSIONS: ["SendMessages"],
  },
  category: "modals",
  run: async (client, interaction, config, db) => {
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId }); // Use 'username' instead of 'id'

    if (!user) {
      await interaction.reply(
        "You need to use the wish command to obtain characters and weapons first."
      );
      return;
    }

    // Get the selected character from the interaction options
    const selectedCharacter = interaction.options.getString("character");

    // Find the selected character in the user's characters array
    const userCharacter = user.characters.find(
      (character) => character.name === selectedCharacter
    );

    if (!userCharacter) {
      // Handle case where the selected character is not found
      interaction.reply("hmm, it looks like you dont own the character");
      return;
    }

    // Check if the user has enough constellation counts
    if (userCharacter.constellation <= 0) {
      // Handle case where the user doesn't have enough constellation counts
      interaction.reply(
        "hmm, it looks like you don't have any constellation for this character  "
      );
      return;
    }
    if (userCharacter.activeConstellation >= 3) {
      interaction.reply(
        "Sorry but it looks like you have reach the maximum constellation for this character"
      );
      return;
    }

    // Calculate the stat boost (50% increase)
    const statBoost = {
      hp: userCharacter.hp * 0.5,
      atk: userCharacter.atk * 0.5,
      def: userCharacter.def * 0.5,
      critDmg: userCharacter.critDmg * 0.5,
      critRate: userCharacter.critRate * 0.5,
    };

    // Update the character's stats
    userCharacter.hp += statBoost.hp;
    userCharacter.atk += statBoost.atk;
    userCharacter.def += statBoost.def;
    userCharacter.critDmg += statBoost.critDmg;
    userCharacter.critRate += statBoost.critRate;

    // Decrease the constellation count by 1
    userCharacter.constellation -= 1;
    userCharacter.activeConstellation += 1;

    // Save the updated user data back to the database
    await user.save();

    // Send a response to the user
    const response = new EmbedBuilder()
      .setTitle("Constellation Equipped")
      .setColor("#00FF00")
      .setDescription(
        `${selectedCharacter}'s constellation has been equipped. Your stats have been boosted!`
      );

    await interaction.reply({ embeds: [response] });
  },
};
