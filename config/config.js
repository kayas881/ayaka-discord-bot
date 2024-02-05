module.exports = {
  Prefix: process.env.PREFIX || "aya",
  Users: {
    OWNERS: process.env.OWNERS ? process.env.OWNERS.split(",") : [],
  },
  Handlers: {
    MONGO: process.env.MONGO || "", // Your MongoDB URI
  },
  Client: {
    TOKEN: process.env.TOKEN || "", // Your bot token
    ID: process.env.ID || "", // Your bot ID
  },
};
