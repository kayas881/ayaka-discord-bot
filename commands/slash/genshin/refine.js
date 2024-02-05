const User = require("../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "refine",
  description: "Refine your weapon to boost your weapon stats",
  type: 1,
  options: [
    {
      name: "weapon",
      description: "The weapon to equip",
      type: 3, // String type
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
    const userId = interaction.user.username;
    const user = await User.findOne({ username: userId }); // Use 'username' instead of 'id'
    const weaponCard = user.items.find((item) => item.itemId === "3007");
    if (!user) {
      await interaction.reply(
        "You need to use the wish command to obtain characters and weapons first."
      );
      return;
    }
    if (!weaponCard || weaponCard.count === 0) {
      interaction.reply(
        "oops, it looks like you don't have a weapon card. You can get them by wishing"
      );
      return;
    }

    // Get the selected character from the interaction options
    const selectedWeapon = interaction.options.getString("weapon");

    // Find the selected character in the user's characters array
    const userWeapon = user.weapons.find((w) => w.name === selectedWeapon);
    if (!userWeapon) {
      // Handle case where the selected character is not found
      interaction.reply("hmm, it looks like you dont own the Weapon");
      return;
    }

    // Check if the user has enough constellation counts
    if (userWeapon.refinement <= 0) {
      // Handle case where the user doesn't have enough constellation counts
      interaction.reply(
        "hmm, it looks like you don't have any refinements for this weapon "
      );
      return;
    }
    if (userWeapon.activeRefinement >= 3) {
      interaction.reply(
        "Sorry but you have reach the maximum Refinements for this weapon"
      );
      return;
    }

    // Calculate the stat boost (50% increase)
    const statBoost = {
      hp: userWeapon.hp * 0.5,
      atk: userWeapon.atk * 0.5,
      def: userWeapon.def * 0.5,
      critDmg: userWeapon.critDmg * 0.5,
      critRate: userWeapon.critRate * 0.5,
    };

    // Update the character's stats
    userWeapon.hp += statBoost.hp;
    userWeapon.atk += statBoost.atk;
    userWeapon.def += statBoost.def;
    userWeapon.critDmg += statBoost.critDmg;
    userWeapon.critRate += statBoost.critRate;

    // Decrease the constellation count by 1
    userWeapon.refinement -= 1;
    userWeapon.activeRefinement += 1;
    weaponCard.count -= 1;
    if (weaponCard.count === 0) {
      user.items = user.items.filter((item) => item.itemId !== "3007");
    }
    // Save the updated user data back to the database
    await user.save();

    // Send a response to the user
    const response = new EmbedBuilder()
      .setTitle("Weapon Refined")
      .setColor("#00FF00")
      .setDescription(
        `${selectedWeapon}'s constellation has been equipped. Your stats have been boosted!`
      );

    await interaction.reply({ embeds: [response] });
  },
};
