const { EmbedBuilder } = require("discord.js");
const { simulatePvPBattle } = require("../../../struct/pvpBattleUtils");
const User = require("../../../schemas/currencySchema");

module.exports = {
  name: "pvpbattle",
  description: "Challenge another user to a PvP battle",
  type: 1,
  options: [
    {
      name: "opponent",
      description: "The user you want to challenge",
      type: 6, // USER type
      required: true,
    },
  ],
  cooldown: 180,
  permissions: {
    DEFAULT_PERMISSIONS: "",
    DEFAULT_MEMBER_PERMISSIONS: "",
  },

  run: async (client, interaction, config, db) => {
    let resultEmbed;
    const challengerUsername = interaction.user.username;
    const challengerPfp = interaction.user.displayAvatarURL({ dynamic: true });
    const opponent = interaction.options.getUser("opponent");
    const opponentPfp = opponent.displayAvatarURL({ dynamic: true });
    const resinCost = 40;


    if (!opponent || opponent.bot || opponent.id === interaction.user.id) {
      return interaction.reply(
        "Invalid opponent. Please mention a valid user to challenge."
      );
    }

    const challenger = await User.findOne({ username: challengerUsername });
    const opponentUser = await User.findOne({ username: opponent.username });

    if (!challenger || !opponentUser) {
      return interaction.reply("please register using register command.");
    }
    if (challenger.rank < 35 && opponentUser.rank < 35) {
      return interaction.reply("wait, both users should be rank 35 or more");
    }
    if (challenger.resin < resinCost || opponentUser.resin < resinCost) {
      return interaction.reply(
        "Both users must have at least 40 resin to start a PvP battle."
      );
    }

    if (
      !challenger.equippedCharacter.length ||
      !challenger.equippedWeapon.length ||
      !opponentUser.equippedCharacter.length ||
      !opponentUser.equippedWeapon.length
    ) {
      // Check if both users have equipped characters and weapons
      return interaction.reply(
        "Both users must have equipped characters and weapons to start a PvP battle."
      );
    }
    challenger.resin -= resinCost;
    opponentUser.resin -= resinCost;
    await Promise.all([challenger.save(), opponentUser.save()]);

    const confirmationEmbed = new EmbedBuilder()
      .setColor("#00FFFF")
      .setTitle("Battle Challenge")
      .setDescription(
        `${challenger.username} has challenged ${opponentUser.username} to a PvP battle! Do you accept?`
      )
      .setThumbnail(challengerPfp);

    const confirmationMessage = await interaction.reply({
      embeds: [confirmationEmbed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3, // GREEN button style
              label: "Accept",
              custom_id: "accept_button",
            },
            {
              type: 2,
              style: 4, // RED button style
              label: "Reject",
              custom_id: "reject_button",
            },
          ],
        },
      ],
    });

    const filter = (i) => {
      i.deferUpdate();
      return (
        (i.customId === "accept_button" && i.user.id === opponent.id) ||
        (i.customId === "reject_button" && i.user.id === opponent.id)
      );
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000, // Set a timeout for 30 seconds
    });

    collector.on("collect", async (i) => {
      if (i.customId === "accept_button") {
        // Handle the case where the opponent accepts the challenge
        // Perform the battle simulation here
        const loadingEmbed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle("Battle Simulation")
          .setDescription("Preparing for battle... Please wait.");

        await confirmationMessage.edit({
          embeds: [loadingEmbed],
          components: [],
        });

        const { battleResult } = await simulatePvPBattle(
          challenger,
          opponentUser,
          async (log) => {
            // Update the embed with the latest battle log
            const battleProgressEmbed = new EmbedBuilder()
              .setColor("#00FF00") // You can set the color accordingly
              .setTitle("Battle Progress")
              .setDescription("```" + log + "```");

            await confirmationMessage.edit({
              embeds: [battleProgressEmbed],
            });
          }
        );

        // Handle the outcome and update rewards
        if (battleResult === challenger) {
          // User1 (challenger) wins
          const primogemsReward = Math.floor(
            Math.random() * (50 - 20 + 1) + 20
          );
          const moraReward = Math.floor(Math.random() * (1000 - 500 + 1) + 500);

          challenger.primogems += primogemsReward;
          challenger.mora += moraReward;

          // Save the updated challenger data
          await challenger.save();

          resultEmbed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`${challenger.username} defeats ${opponentUser.username}`)
            .setDescription(
              `You got ${primogemsReward} primos and ${moraReward}`
            )
            .setThumbnail(challengerPfp);
        } else if (battleResult === opponentUser) {
          // User2 (opponent) wins
          const primogemsReward = Math.floor(
            Math.random() * (50 - 20 + 1) + 20
          );
          const moraReward = Math.floor(Math.random() * (1000 - 500 + 1) + 500);

          opponentUser.primogems += primogemsReward;
          opponentUser.mora += moraReward;

          // Save the updated opponent data
          await opponentUser.save();

          resultEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`${opponentUser.username} defeats ${challenger.username}`)
            .setDescription(
              `You got ${primogemsReward} primos and ${moraReward}`
            )
            .setThumbnail(opponentPfp); // Set the winner's avatar
        } else {
          // It's a draw
          resultEmbed = new EmbedBuilder()
            .setColor("#FFFF00")
            .setTitle("PvP Battle Result - Draw");
        }

        // Inform users about the win
        await confirmationMessage.edit({
          embeds: [resultEmbed],
        });
      } else if (i.customId === "reject_button") {
        // Handle the case where the opponent rejects the challenge
        await confirmationMessage.edit({
          content: `${opponent.username} has rejected the PvP battle challenge.`,
          embeds: [],
          components: [],
        });
      }

      // Stop the collector
      collector.stop();
    });

    collector.on("end", (collected) => {
      // Handle the case where the collector times out
      if (collected.size === 0) {
        confirmationMessage.edit({
          content: "The PvP battle challenge has timed out.",
          embeds: [],
          components: [],
        });
      }
    });
  },
};
