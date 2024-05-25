const { Message, CommandInteraction, ApplicationCommandOptionType, RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Bot, Responder } = require('../../../../base/classes');
const { stripIndent } = require('common-tags');
class ClickDel extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "otorol",
            description: "Otorol seçmenizi sağlar",
            customId: "otorol",
            type: 1,
            flag: "slash",
            rootOnly: true,
        });
    }
    /**
     * @param {Bot} client
     * @param {CommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const RoleMenu = new RoleSelectMenuBuilder().setCustomId("otorol").setPlaceholder("Otorol seçiniz").setMinValues(0).setMaxValues(10);
        const ConfirmButton = new ButtonBuilder().setCustomId("confirm").setLabel("onayla").setStyle(1);
        const CancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("iptal").setStyle(4);
        const response = await interaction.reply({
            content: "Otorol seçiniz",
            components: [
                new ActionRowBuilder().addComponents(RoleMenu),
                new ActionRowBuilder().addComponents(ConfirmButton, CancelButton)
            ]
        });
        const filter = (i) => {
            if (i.user.id !== interaction.user.id) return false;
            return true;
        }
        const collector = response.createMessageComponentCollector({ filter, time: 60_000 });
        let roles = [];
        collector.on("collect", async (i) => {
            i.deferUpdate();
            if (i.customId === "confirm") {
                await response.edit({
                    content: "Otorol seçimi onaylandı",
                    components: [],
                    embeds: [
                        new EmbedBuilder().setTitle("Otorol seçimi").setDescription(stripIndent`
                            Seçilen roller:
                            ${roles.length > 0 ? roles.map(r => `<@&${r}>`).join("\n") : "Seçilen rol yok"}
                        `)
                    ]
                });
                collector.stop();
            } else if (i.customId === "cancel") {
                await response.edit({
                    content: "Otorol seçimi iptal edildi",
                    components: []
                });
                collector.stop();
            } else if (i.customId === "otorol") {
                roles = i.values;
            }
        });
        collector.on("end", async (collected) => {
            roles.forEach(async (role) => {
                await client.models.roles.findOneAndUpdate({ meta: { $elemMatch: { _id: role.id } } }, { keyConf: "otorol" });
            });
        });

    }
}

module.exports = ClickDel;