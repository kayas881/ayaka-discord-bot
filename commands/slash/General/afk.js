const { AFKSchema } = require("../../../schemas/main");

module.exports = {
  name: "afk",
  description: "Set yourself AFK on the server.",
  type: 1,
  options: [
    {
      name: "reason",
      description: "The AFK reason.",
      type: 3,
      required: false,
    },
  ],
  cooldown: 10,
  permissions: {
    DEFAULT_MEMBER_PERMISSIONS: "SendMessages",
  },
  category: "general",
  run: async (client, interaction) => {
    const reasonInput = interaction.options.get("reason")?.value || null;

    AFKSchema.findOne(
      {
        guild: interaction.guild.id,
        user: interaction.user.id,
      },
      async (err, data) => {
        if (err) throw err;

        if (!data) {
          data = new AFKSchema({
            guild: interaction.guild.id,
            user: interaction.user.id,
            reason: reasonInput,
          });

          data.save();

          const newUserNickname = "[AFK] " + interaction.user.username;

          await interaction.member
            .setNickname(newUserNickname.toString().substr(0, 26))
            .catch(() => {});

          interaction.channel.send({
            content: `\`🛏️\` ${interaction.user} is now **AFK**. ${
              reasonInput === null ? "" : `Reason: ${reasonInput}`
            }`,
          });

          return interaction.reply({
            content: `\`✅\` I have set you AFK${
              reasonInput === null ? "" : ` with the reason: **${reasonInput}**`
            }`,
            ephemeral: true,
          });
        } else {
          return interaction.reply({
            content: `\`❌\` You already set yourself AFK.\nTo stop this from happening, send a message in any channel!`,
            ephemeral: true,
          });
        }
      }
    );
  },
};
