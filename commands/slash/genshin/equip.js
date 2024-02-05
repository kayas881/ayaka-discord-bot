const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AutocompleteInteraction,
} = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const weaponData = require("./../../../Wishjsons/weapons.json");
const characterData = require("./../../../Wishjsons/characters.json");
module.exports = {
  name: "equip",
  description: "Equip a character and a weapon to boost your total HP and ATK",
  type: 1,
  options: [
    {
      name: "character",
      description: "The character to equip",
      type: 3,
      required: true,
      autocomplete: true,
    },
    {
      name: "weapon",
      description: "The weapon to equip",
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
  cooldown: 20,
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId });

    if (focusedOption.name === "character") {
      choices = user.characters.map((character) => character.name);
    }
    if (focusedOption.name === "weapon") {
      choices = user.weapons.map((weapon) => weapon.name);
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
    const characterName = interaction.options.getString("character");
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId });
    if (!user) {
      await interaction.reply(
        "You need to use the wish command to obtain characters and weapons first."
      );
      return;
    }
    const weaponName = interaction.options.getString("weapon");
    const character = characterData.characters.find(
      (c) => c.name === characterName
    );
    const weapon = weaponData.weapons.find((w) => w.name === weaponName);
    if (!character || !weapon) {
      await interaction.reply(
        "Invalid character or weapon name. Please check your inputs and try again."
      );
      return;
    }
    if (character.weapon.toLowerCase() !== weapon.type.toLowerCase()) {
      await interaction.reply(
        `${characterName} cannot be equipped with ${weaponName}.`
      );
      return;
    }
    const ownsCharacter = user.characters.find(
      (c) => c.characterId === character.id
    );
    const ownsWeapon = user.weapons.find((w) => w.weaponId === weapon.id);
    if (!ownsCharacter || !ownsWeapon) {
      await interaction.reply(
        "You don't own the specified character or weapon."
      );
      return;
    }
    const characters = user.characters;
    // Fetch detailed stats from JSON files
    const characterStats = characterData.characters.find(
      (c) => c.name === characterName
    ).stats;
    const weaponStats = weaponData.weapons.find(
      (w) => w.name === weaponName
    ).stats;
    const weapons = user.weapons;
    const characterObject = user.characters.find(
      (c) => c.characterId === characters
    );
    const weaponObject = user.weapons.find((w) => w.weaponId === weapons);
    // Update equippedCharacter and equippedWeapon arrays
    user.equippedCharacter = [
      {
        characterId: character.id,
        name: character.name,
        hp: ownsCharacter.hp,
        atk: ownsCharacter.atk,
        def: ownsCharacter.def,
        critRate: ownsCharacter.critRate,
        critDmg: ownsCharacter.critDmg,
        constellation: ownsCharacter.constellation,
        activeConstellation: ownsCharacter.activeConstellation,
      },
    ];

    user.equippedWeapon = [
      {
        weaponId: weapon.id,
        name: weapon.name,
        hp: ownsWeapon.hp,
        atk: ownsWeapon.atk,
        def: ownsWeapon.def,
        critRate: ownsWeapon.critRate,
        critDmg: ownsWeapon.critDmg,
        refinement: ownsWeapon.refinement,
        activeRefinement: ownsWeapon.activeRefinement,
      },
    ];
    await user.save();
    // Calculate total stats
    const equippedCharacter = user.equippedCharacter[0];
    const equippedWeapon = user.equippedWeapon[0];
    const totalHP = equippedCharacter.hp + equippedWeapon.hp;
    const totalATK = equippedCharacter.atk + equippedWeapon.atk;
    const totalCritDmg = equippedCharacter.critDmg + equippedWeapon.critDmg;
    const totalDef = equippedCharacter.def + equippedWeapon.def;
    const totalCritRate = equippedCharacter.critRate + equippedWeapon.critRate;

    user.totalHP = totalHP;
    user.totalATK = totalATK;
    user.totalDef = totalDef;
    user.totalCritDmg = totalCritDmg;
    user.totalCritRate = totalCritRate;

    await user.save();
    await interaction.reply(
      `You have equipped ${characterName} with ${weaponName}. Your total HP is now ${totalHP} and your total ATK is now ${totalATK}.`
    );
  },
};
