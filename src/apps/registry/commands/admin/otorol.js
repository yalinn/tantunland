import { CommandInteraction, RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import Responder from '@/classes/Responder';
import Bot from '@/classes/Bot';
import { stripIndent } from 'common-tags';
export default class ClickDel extends Responder {
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
        const Menus = [
            new RoleSelectMenuBuilder().setCustomId("otorol").setPlaceholder("Otorol rolü").setMinValues(0).setMaxValues(5),
            new RoleSelectMenuBuilder().setCustomId("stranger").setPlaceholder("Yabancı rolü").setMinValues(0).setMaxValues(5),
            new RoleSelectMenuBuilder().setCustomId("guest").setPlaceholder("Ziyaretçi rolü").setMinValues(0).setMaxValues(5),
            new RoleSelectMenuBuilder().setCustomId("member").setPlaceholder("Üye rolü").setMinValues(0).setMaxValues(5)
        ].map((menu) => new ActionRowBuilder().addComponents(menu));
        const ConfirmButton = new ButtonBuilder().setCustomId("confirm").setLabel("onayla").setStyle(1);
        const CancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("iptal").setStyle(4);
        const response = await interaction.reply({
            content: "Otorol seçiniz",
            components: [
                ...Menus,
                new ActionRowBuilder().addComponents(ConfirmButton, CancelButton)
            ]
        });
        const filter = (i) => {
            if (i.user.id !== interaction.user.id) return false;
            return true;
        }
        const collector = response.createMessageComponentCollector({ filter, time: 60_000 });
        let roles = { otorol: [], stranger: [], guest: [], member: [] }
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
            } else {
                roles[i.customId] = i.values;
            }
        });
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await response.edit({
                    content: "Otorol seçimi iptal edildi",
                    components: []
                });
            }
            Object.keys(roles).filter(rolename => roles[rolename].length > 0).forEach(async (key) => {
                await client.models.roles.findOneAndUpdate({ meta: { $elemMatch: { _id: roles[key] } } }, { keyConf: key });
            });
        });

    }
}
