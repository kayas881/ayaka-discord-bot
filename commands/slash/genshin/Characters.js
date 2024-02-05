const { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../../schemas/currencySchema");
const weaponData = require("../../../Wishjsons/weapons.json");
const characterData = require("../../../Wishjsons/characters.json");

function getItems(user, category) {
    return category === "Characters" ? user.characters : user.weapons;
}

function createWeaponEmbed(category, currentPage, items) {
    const startIndex = currentPage * 1;
    const endIndex = (currentPage + 1) * 1;
    const pageItems = items.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
        .setTitle(`${category} - Page ${currentPage + 1}`)
        .setColor("#ffcc00");

    if (pageItems.length > 0) {
        pageItems.forEach((item) => {
            const weaponInfo = weaponData.weapons.find((weapon) => weapon.id === item.weaponId);
            if (weaponInfo) {
                const starRating = ":star:".repeat(weaponInfo.rarity);
                const duplicates = item.count > 1 ? `(x${item.count})` : "";
                const weaponIcon = weaponInfo.image;
                const weaponType = weaponInfo.type;
                if (weaponIcon) {
                    embed.addFields(
                        {
                            name: `${weaponInfo.name} ${duplicates}`,
                            value: `Rarity: ${starRating}`
                        }
                    );
                    embed.setThumbnail(weaponIcon); // Use weaponIcon.image for the thumbnail
                    embed.setDescription(
                        "**ATK**: " + item.atk + "\n" +
                        "**HP**: " + item.hp + "\n" +
                        "**DEF**: " + item.def + "\n" +
                        "**CRIT Rate**: " + item.critRate + "\n" +
                        "**CRIT DMG**: " + item.critDmg + "\n" +
                        "**Refinement**: " + item.refinement + "\n" +
                        "**ActiveRefinement**: " + item.activeRefinement + "\n" +
                        "**Weapon Type**: " + weaponType + "\n"
                    );
                }
            }
        });
    }

    return embed;
}

function createCharacterEmbed(category, currentPage, items) {
    const startIndex = currentPage * 1;
    const endIndex = (currentPage + 1) * 1;
    const pageItems = items.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
        .setTitle(`${category} - Page ${currentPage + 1}`)
        .setColor("#ffcc00");

    if (pageItems.length > 0) {
        pageItems.forEach((item) => {
            const characterInfo = characterData.characters.find((char) => char.id === item.characterId);
            if (characterInfo) {
                const starRating = ":star:".repeat(characterInfo.rarity);
                const duplicates = item.count > 1 ? `(x${item.count})` : "";
                const characterIcon = characterData["character Icons"].find((icon) => icon.Name === characterInfo.name);
                const characterWeaponType = characterInfo.weapon;
                if (characterIcon) {
                    embed.addFields(
                        {
                            name: `${characterInfo.name} ${duplicates}`,
                            value: `Rarity: ${starRating}`
                        }
                    );
                    embed.setThumbnail(characterIcon.image); // Use characterIcon.image for the thumbnail
                    embed.setDescription(
                        "**HP**: " + item.hp + "\n" +
                        "**ATK**: " + item.atk + "\n" +
                        "**DEF**: " + item.def + "\n" +
                        "**CRIT Rate**: " + item.critRate + "\n" +
                        "**CRIT DMG**: " + item.critDmg + "\n" +
                        "**Constellation**: " + item.constellation + "\n" +
                        "**ActiveConstellation**: " + item.activeConstellation + "\n" +
                        "**Weapon Type**: " + characterWeaponType + "\n"
                    );
                }
            }
        });
    }

    return embed;
}

module.exports = {
    name: "characters",
    description: "shows all characters and weapons from user inventory",
    type: 1,
    options: [],
    cooldown: 20,
    permissions: {
        DEFAULT_PERMISSIONS: "",
        DEFAULT_MEMBER_PERMISSIONS: "",
    },
    run: async (client, interaction, config, db) => {
        let user = await User.findOne({ username: interaction.user.username });
        if (!user || (user.characters.length === 0 && user.weapons.length === 0)) {
            return interaction.channel.send("You have not obtained any characters or weapons yet.");
        }

        const categories = ["Characters", "Weapons"];

        const categorySelect = new StringSelectMenuBuilder()
            .setCustomId("categorySelect")
            .setPlaceholder("Select a category")
            .addOptions(
                categories.map((category) => ({
                    label: category,
                    value: category,
                }))
            );

        const prevButton = new ButtonBuilder()
            .setCustomId("prevButton")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary);

        const nextButton = new ButtonBuilder()
            .setCustomId("nextButton")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary);

        const buttonRow = new ActionRowBuilder().addComponents(
            prevButton,
            nextButton
        );

        await interaction.reply({
            content: "Here are the characters and weapons you have obtained:",
            components: [
                new ActionRowBuilder().addComponents(categorySelect),
                buttonRow,
            ],
        });

        let currentPage = 0;
        let selectedCategory = "Characters";

        const filter = (interaction) => {
            return (
                interaction.customId === "categorySelect" ||
                interaction.customId === "prevButton" ||
                interaction.customId === "nextButton"
            );
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 100000,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "categorySelect") {
                selectedCategory = interaction.values[0];
                currentPage = 0;
            } else if (interaction.customId === "prevButton") {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (interaction.customId === "nextButton") {
                const maxPage = Math.ceil(getItems(user, selectedCategory).length / 1) - 1;
                currentPage = Math.min(currentPage + 1, maxPage);
            }

            const items = getItems(user, selectedCategory);
            let embed;
            if (selectedCategory === "Characters") {
                embed = createCharacterEmbed(selectedCategory, currentPage, items);
            } else {
                embed = createWeaponEmbed(selectedCategory, currentPage, items);
            }
            await interaction.deferUpdate();
            await interaction.editReply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(categorySelect),
                    buttonRow,
                ],
            });
        });

        collector.on("end", (collected) => {
            interaction.editReply({ components: [] });
        });
    },
};
