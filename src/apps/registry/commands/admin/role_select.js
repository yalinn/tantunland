import { CommandInteraction, RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import Responder from '@/classes/Responder';
import Bot from '@/classes/Bot';
import { stripIndent } from 'common-tags';
export default class ClickDel extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "rolemenu",
            description: "Rol menüsü oluşturur veya düzenler",
            customId: "role_select",
            type: "slash",
            flag: "slash",
            rootOnly: true,
            options: [
                {
                    name: "create",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsü taslağı oluşturur",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü customId",
                            required: true
                        },
                        {
                            name: "placeholder",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü placeholder",
                            required: true
                        },
                        {
                            name: "min",
                            type: ApplicationCommandOptionType.Integer,
                            description: "Minimum seçim",
                            required: true
                        },
                        {
                            name: "max",
                            type: ApplicationCommandOptionType.Integer,
                            description: "Maksimum seçim",
                            required: true
                        },
                    ]
                },
                {
                    name: "edit",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsü düzenler",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü customId",
                            required: true
                        },
                        {
                            name: "placeholder",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü placeholder",
                            required: false
                        },
                        {
                            name: "min",
                            type: ApplicationCommandOptionType.Integer,
                            description: "Minimum seçim",
                            required: false
                        },
                        {
                            name: "max",
                            type: ApplicationCommandOptionType.Integer,
                            description: "Maksimum seçim",
                            required: false
                        },
                    ]
                },
                {
                    name: "delete",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsünü siler",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü customId",
                            required: true
                        }
                    ]
                },
                {
                    name: "add",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsüne rol ekler",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü customId",
                            required: true
                        },
                        {
                            name: "role",
                            type: ApplicationCommandOptionType.Role,
                            description: "Eklenecek rol",
                            required: true
                        },
                        {
                            name: "emoji",
                            type: ApplicationCommandOptionType.String,
                            description: "Emoji",
                            required: false
                        },
                        {
                            name: "placeholder",
                            type: ApplicationCommandOptionType.String,
                            description: "Placeholder",
                            required: false
                        },
                        {
                            name: "description",
                            type: ApplicationCommandOptionType.String,
                            description: "Açıklama",
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsünden rol kaldırır",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Menü customId",
                            required: true
                        },
                        {
                            name: "role",
                            type: ApplicationCommandOptionType.Role,
                            description: "Kaldırılacak rol",
                            required: true
                        }
                    ]
                },
                {
                    name: "list",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menülerini listeler",
                },
                {
                    name: "summon",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Rol menüsünü kanalda oluşturur",
                    options: [
                        {
                            name: "customid",
                            type: ApplicationCommandOptionType.String,
                            description: "Rolemenu id",
                            required: true
                        },
                        {
                            name: "channel",
                            type: ApplicationCommandOptionType.Channel,
                            description: "Kanal",
                            required: true
                        }
                    ]
                }
            ]
        });
    }
    /**
     * @param {Bot} client
     * @param {CommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const data = interaction.options.data
        const subcommand = data[0].name;
        switch (subcommand) {
            case "create":
                const customId = data[0].options[0].value;
                const placeholder = data[0].options[1].value;
                const min = data[0].options[2].value;
                const max = data[0].options[3].value;
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .setMinValues(min)
                    .setMaxValues(max);
                interaction.reply({
                    content: "Rol menüsü oluşturuldu",
                    components: [new ActionRowBuilder().addComponents(menu)]
                });
                break;
            case "edit":
                const customId = data[0].options[0].value;
                const placeholder = data[0].options[1].value;
                const min = data[0].options[2].value;
                const max = data[0].options[3].value;
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .setMinValues(min)
                    .setMaxValues(max);
                interaction.reply({
                    content: "Rol menüsü düzenlendi",
                    components: [new ActionRowBuilder().addComponents(menu)]
                });
                break;
            case "delete":
                const customId = data[0].options[0].value;
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId(customId);
                interaction.reply({
                    content: "Rol menüsü silindi",
                    components: [new ActionRowBuilder().addComponents(menu)]
                });
                break;
            case "add":
                const customId = data[0].options[0].value;
                const role = data[0].options[1].value;
                const emoji = data[0].options[2].value;
                const placeholder = data[0].options[3].value;
                const description = data[0].options[4].value;
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .addOption(role, emoji, placeholder, description);
                interaction.reply({
                    content: "Rol menüsüne rol eklendi",
                    components: [new ActionRowBuilder().addComponents(menu)]
                });
                break;
            case "remove":
                const customId = data[0].options[0].value;
                const role = data[0].options[1].value;
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .removeOption(role);
                interaction.reply({
                    content: "Rol menüsünden rol kaldırıldı",
                    components: [new ActionRowBuilder().addComponents(menu)]
                });
                break;
            case "list":
                break;
            default:
                break;
        }
    }
}
