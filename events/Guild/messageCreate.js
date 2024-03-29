const { EmbedBuilder, PermissionsBitField, codeBlock } = require("discord.js");
const client = require("../../index");
const config = require("../../config/config.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { AFKSchema } = require("../../schemas/main");
const { ChannelType } = require("discord.js");
const User = require("./../../schemas/currencySchema.js");
const GuildSettings = require("./../../schemas/GuildSchema.js");
const commandCooldowns = new Map();
// Function to regenerate resin for a user

const {
  getXPToLevelUp,
  getARLevelName,
  updateARRank,
  increaseExperience,
} = require("./../../struct/xputills.js");
module.exports = {
  name: "messageCreate",
};
// AFK System
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === ChannelType.DM) return;

  if (!message.mentions.members.first()) {
    AFKSchema.findOne(
      {
        user: message.author.id,
        guild: message.guild.id,
      },
      async (err, data) => {
        if (err) throw err;
        if (data) {
          await message.member
            .setNickname(message.member.user.username)
            .catch(() => {});

          if (data.loggerType === true) {
            return message
              .reply({
                content: "**Welcome back!** I have removed your AFK.",
              })
              .then(async (sent) => {
                setTimeout(async () => {
                  await AFKSchema.deleteOne({
                    user: message.author.id,
                    guild: message.guild.id,
                  });

                  return sent.delete().catch(() => {});
                }, 8000);
              });
          } else {
            return message
              .reply({
                content: "**Welcome back!** I have removed your AFK.",
              })
              .then(async (sent) => {
                setTimeout(async () => {
                  await AFKSchema.deleteOne({
                    user: message.author.id,
                    guild: message.guild.id,
                  });

                  return sent.delete().catch(() => {});
                }, 8000);
              });
          }
        } else return;
      }
    );
  } else {
    AFKSchema.findOne(
      {
        user: message.mentions.members.first().id,
        guild: message.guild.id,
      },
      async (err, data) => {
        if (err) throw err;
        if (data) {
          return message.reply(
            `That user is currently **AFK**. ${
              data.reason !== null ? `Reason: ${data.reason}` : ""
            }`
          );
        } else return;
      }
    );
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.channel.type === "DM") return;

  try {
    let user = await User.findOne({ userId: message.author.id });

    if (!user) {
      return;
    }
    // Check if 24 hours have passed since the last XP reset
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    const now = new Date();
    if (now - user.lastXpReset >= oneDay) {
      // Reset the XP limit and update the last reset timestamp
      user.userXpLimit = 0;
      user.lastXpReset = now;
    }

    // Check if the channel is blacklisted
    const guildSettings = await GuildSettings.findOne({
      guildId: message.guild.id,
    });
    const isBlacklisted =
      guildSettings &&
      guildSettings.blacklistedChannels.includes(message.channel.id);

    if (isBlacklisted) {
      console.log(
        `XP gain is disabled in the blacklisted channel: ${message.channel.name}`
      );
      return;
    }
    if (user.userXpLimit >= 500) return;

    const minXP = 5;
    const maxXP = 10;

    // Add XP for each message sent by the user
    const userId = message.author.id;
    const experienceGained = Math.floor(
      Math.random() * (maxXP - minXP + 1) + minXP
    );
    await updateARRank(message, userId, experienceGained, message.channel);
    user.userXpLimit += experienceGained;
    await user.save();
  } catch (error) {
    console.error("Error processing message:", error);
  }
});
client.on("messageCreate", async (message) => {
  if (message.channel.type !== 0) return;
  if (message.author.bot) return;

  const prefix =
    (await db.get(`guild_prefix_${message.guild.id}`)) || config.Prefix || "?";

  if (!message.content.startsWith(prefix)) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;

  let command = client.prefix_commands.get(cmd);

  if (!command) return;
  // Check if the command is disabled
  const guildId = message.guild.id;
  let guildSettings = await GuildSettings.findOne({ guildId });
  if (!guildSettings) {
    guildSettings = new GuildSettings({
      guildId: guildId,
      disabledCommands: [],
      blacklistedChannels: [],
    });
    await guildSettings.save();
  }
  const disabledCommands = guildSettings.disabledCommands;

  if (disabledCommands.includes(command.config.name)) {
    return message.reply(
      `The command \`${command.config.name}\` is disabled in this server.`
    );
  }
  // Check if the command has a cooldown
  if (command.config.cooldown) {
    const key = `${message.author.id}:${command.config.name}`;
    const now = Date.now();
    const cooldownTime = command.config.cooldown * 1000; // Cooldown time in milliseconds

    if (commandCooldowns.has(key)) {
      const lastTime = commandCooldowns.get(key);

      // Check if the cooldown period has passed
      if (now - lastTime < cooldownTime) {
        const remainingTime = cooldownTime - (now - lastTime);
        return message.reply({
          content: `Please wait ${Math.ceil(
            remainingTime / 1000
          )} seconds before using this command again.`,
          ephemeral: true, // Set to true if you want the message to only be visible to the user who triggered the command
        });
      }
    }

    // Update the cooldown timestamp
    commandCooldowns.set(key, now);
  }
  if (command) {
    if (command.permissions) {
      if (
        !message.member.permissions.has(
          PermissionsBitField.resolve(command.permissions || [])
        )
      )
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `🚫 Unfortunately, you are not authorized to use this command.`
              )
              .setColor("Red"),
          ],
        });
    }

    if ((command.owner, command.owner == true)) {
      if (config.Users?.OWNERS) {
        const allowedUsers = []; // New Array.

        config.Users.OWNERS.forEach((user) => {
          const fetchedUser = message.guild.members.cache.get(user);
          if (!fetchedUser) return allowedUsers.push("*Unknown User#0000*");
          allowedUsers.push(`${fetchedUser.user.tag}`);
        });

        if (!config.Users.OWNERS.some((ID) => message.member.id.includes(ID)))
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🚫 Sorry but only owners can use this command! Allowed users:\n**${allowedUsers.join(
                    ", "
                  )}**`
                )
                .setColor("Red"),
            ],
          });
      }
    }

    try {
      command.run(client, message, args, prefix, config, db);
    } catch (error) {
      console.error(error);
    }
  }
});
