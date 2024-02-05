const User = require("./../../../schemas/currencySchema");
const arUtils = require("./../../../struct/xputills"); // Import the updated utility functions for AR

module.exports = {
  config: {
    name: "register",
    description: "Registers the user in the database",
    usage: "register",
  },
  permissions: ["SendMessages"],
  owner: false,
  run: async (client, message, args, prefix, config, db, interaction) => {
    const user = await User.findOne({ username: message.author.username });
    if (user) {
      message.reply(
        "You are already registered in the database. Use the balance command to check your Profile."
      );
      return;
    }

    const newUser = new User({
      username: message.author.username,
      userId: message.author.id,
      rank: 1,
      rankName: "NPC",
      experience: 0,
      mora: 0,
      primogems: 0,
      resin: 0,
      lastResinRefresh: Date.now(),
      bio: "",
      characters: [],
      weapons: [],
      items: [],
      favoriteCharacter: "",
      bannerUrl: "https://i.imgur.com/2TR8kBp.jpeg",
      equippedBanner: "https://i.imgur.com/2TR8kBp.jpeg",
      inventory: [],
      activeElixir: 0,
      pity5Star: 0,
      wishesMade: 0,
      pity4Star: 0,
      pity3StarWeapon: 0,
      equippedCharacter: [], // Initialize equipped character to an array
      equippedWeapon: [], // Initialize equipped weapon to an arra
      totalHP: 0, // Assign a default value for totalHP
      totalATK: 0, // Assign a default value for totalATK
      totalDef: 0, // Assign a default value for totalATK
      totalCritDmg: 0,
      totalCritRate: 0,
      lastWorkTimestamp: 0,
      lastTreasureHuntTimestamp: 0,
      rankName: "Adventurer",
      profileImage: "",
      equippedColor: "#ffcc00",
      lastDailyClaim: 0,
      lastWeeklyClaim: 0,
      userXpLimit: 0,
      lastXpReset: Date.now(),
      purchaseHistory: [],
    });
    await newUser.save();
    message.reply(
      "You have been successfully registered in the database. Use the !status command to check your status."
    );
  },
};
