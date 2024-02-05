const Discord = module.require("discord.js");
const mathjs = module.require("mathjs");
const { EmbedBuilder } = require("discord.js");
module.exports = {config: {
    name: "math", // Name of Command
    description: "Evaluates a mathematical expression.", // Command Description
    usage: "" // Command usage
},
permissions: "", // User permissions needed
owner: false, // Owner only?
    run: async (client, message, args, prefix, config, db, interaction) => {
        if (args.length == 0) {
            message.channel.send("Usage: =math <expression>");
        }
        else {  
            try {
                let input = args.join(" ");
                var result = mathjs.evaluate(input);
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Calculator')
                    .addFields(
                        { name: 'Input Expression:', value: `${input}` },
                        { name: 'Result:', value: `${result}`}
                    )
                    .setTimestamp()
                message.channel.send({ embeds: [embed] });
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Calculator')
                    .addFields(
                        { name: 'Error:', value: "Input expression could not be evaulated. ask your mom" }
                    )
                    .setTimestamp()
                message.channel.send({ embeds: [embed] });
            }
        }
    },
};