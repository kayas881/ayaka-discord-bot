const { EmbedBuilder } = require("discord.js");
const User = require("./../../../schemas/currencySchema");
const weaponData = require("./../../../Wishjsons/weapons.json");
const emojis = require("./../../../utilitiesJsons/emojis.json");
module.exports = {
  name: "dismantle", // Name of command
  description: "dismantle all 3 star weapons exept......", // Command description
  type: 1, // Command type
  options: [
    {
      name: "weapons",
      description: "The weapons you want to keep",
      type: 3, // String type
      required: false,
      autocomplete: true,
    },
  ], // Command options
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const userId = interaction.user.username;
    let user = await User.findOne({ username: userId });

    let choices;

    if (focusedOption.name === "weapons") {
      choices = user.weapons.map((weapon) => weapon.name);
    }
    const filtered = choices
      .filter((choice) => choice.toLowerCase().startsWith(focusedOption.value))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  cooldown: 20, // Command cooldown
  permissions: {
    DEFAULT_PERMISSIONS: "", // Client permissions needed
    DEFAULT_MEMBER_PERMISSIONS: "", // User permissions needed
  },
  run: async (client, interaction, config, db) => {
    // execute
    const userId = interaction.user.username;
    let user = await User.findOne({ username: userId });

    let selectedWeapons = interaction.options.getString("weapons");
    selectedWeapons = selectedWeapons
      ? selectedWeapons.toLowerCase().split(", ")
      : [];

    // Get all weapons from the user's inventory and check if they are 3-star weapons with the help of weaponsData.json
    const threeStarWeapons = user.weapons.filter((weapon) => {
      const weaponInfo = weaponData.weapons.find(
        (weaponData) => weaponData.name === weapon.name
      );
      return weaponInfo && weaponInfo.rarity === 3;
    });

    // Get the weapons to dismantle
    if (selectedWeapons.length > 0) {
      var weaponsToDismantle = threeStarWeapons.filter(
        (weapon) => !selectedWeapons.includes(weapon.name.toLowerCase())
      );
    } else {
      var weaponsToDismantle = threeStarWeapons;
    }
    // give random mora for each weapon between 1000 and 2000
    const totalMora = weaponsToDismantle.reduce(
      (total, weapon) => total + Math.floor(Math.random() * 1000 + 1000),
      0
    );
    const totalPrimogems = weaponsToDismantle.reduce(
      (total, weapon) => total + Math.floor(Math.random() * 5 + 20),
      0
    );
    user.mora += totalMora;
    user.primogems += totalPrimogems;
    // Dismantle the weapons
    user.weapons = user.weapons.filter(
      (weapon) => !weaponsToDismantle.includes(weapon)
    );

    // Save the updated user data
    await user.save();

    // Respond to the interaction
    await interaction.reply(
      `Dismantled ${weaponsToDismantle.length} 3-star weapons\n and you got ${totalMora} ${emojis.moraIcon}, ${totalPrimogems} ${emojis.primogemIcon}`
    );
  },
};
