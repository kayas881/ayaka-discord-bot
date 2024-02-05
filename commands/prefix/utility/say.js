module.exports = {
  config: {
    name: "say", // Name of Command
    description: "repeats a sentence", // Command Description
    usage: "", // Command usage
    cooldown: 10,
  },
  permissions: "", // User permissions needed
  owner: false, // Owner only?
  run: async (client, message, args) => {
    if (!args.join(" ")) {
      message.channel.send("Please add some text for me to repeat");
    }
    message.channel.send(args.join(" "), {
      allowedMentions: { parse: ["users"] },
    });
    message.delete();
  },
};
