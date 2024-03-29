const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("./config/config");
const colors = require("colors");
const { regenerateAllResin, regenerateResin } = require("./struct/ResinUtils");
const express = require('express');
const app = express();
// Creating a new client:
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildMessageReactions,

  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  presence: {
    activities: [
      {
        name: "Kayas",
        type: 2,
      },
    ],
    status: "idle",
  
  },
});

// Getting the bot token:
const AuthenticationToken = process.env.TOKEN || config.Client.TOKEN;
if (!AuthenticationToken) {
  console.warn(
    "[CRASH] Authentication Token for Discord bot is required! Use Envrionment Secrets or config.js."
      .red
  );
  return process.exit();
}

// Handler:
client.prefix_commands = new Collection();
client.slash_commands = new Collection();
client.user_commands = new Collection();
client.message_commands = new Collection();
client.modals = new Collection();
client.events = new Collection();
client.UsersBalance = new Collection();

module.exports = client;

["prefix", "application_commands", "modals", "events", "mongoose"].forEach(
  (file) => {
    require(`./handlers/${file}`)(client, config);
  }
);

// Login to the bot:
client
  .login(AuthenticationToken)
  .then(() => {
    setInterval(regenerateAllResin, 1000 * 60); // 1000 milliseconds * 60 seconds = 1 minute
  })
  .catch((err) => {
    console.error(
      "[CRASH] Something went wrong while connecting to your bot..."
    );
    console.error("[CRASH] Error from Discord API:" + err);
    return process.exit();
  });
// currency shit

const mongoose = require("mongoose");

// Handle errors:
process.on("unhandledRejection", async (err, promise) => {
  console.error(`[ANTI-CRASH] Unhandled Rejection: ${err}`.red);
  console.error(promise);
});

const listener = app.listen(process.env.PORT || 8000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
