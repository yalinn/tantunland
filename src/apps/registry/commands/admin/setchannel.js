const { Message, CommandInteraction, ApplicationCommandOptionType, RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Bot, Responder } = require('../../../../base/classes');
const { stripIndent } = require('common-tags');
class ClickDel extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "setchannel",
            description: "Kanal ayarlarını yapmanızı sağlar",
            customId: "setchannel",
            type: 1,
            flag: "slash",
            rootOnly: true,
            options: [
                {
                    name: "anahtar",
                    description: "Değer anahtarını belirtiniz",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "welcome",
                            value: "welcome"
                        }
                    ]
                },
                {
                    name: "atanan_kanal",
                    description: "Kanalı belirtiniz",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        });
    }
    /**
     * @param {Bot} client
     * @param {CommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const channelType = interaction.options.getString("kanal_tipi");
        const channel = interaction.options.getChannel("atanan_kanal");
        if (!channel) return interaction.reply("Kanal bulunamadı");
        if (!interaction.guild.channels.cache.get(channel.id)) return interaction.reply("Kanal bulunamadı");
        await client.models.channels.findOneAndUpdate({ meta: { $elemMatch: { id: channel.id } } }, { $set: { keyConf: channelType } }, { upsert: true });
        interaction.reply({
            content: "Kanal ayarları yapıldı",
            embeds: [
                new EmbedBuilder().setTitle("Kanal ayarları").setDescription(stripIndent`
                    Kanal tipi: ${channelType}
                    Kanal: ${channel}
                `)
            ]
        });

    }
}

module.exports = ClickDel;