const { RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Message, ChannelType } = require('discord.js');
const { Bot, Responder } = require('../../../../base/classes');
const { stripIndent } = require('common-tags');
class ClearMessages extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "puan",
            description: "",
            customId: "puan",
            type: 0,
            flag: "prefix",
            rootOnly: true,
        });
    }
    /**
     * @param {Bot} client
     * @param {Message} message
     */
    async run(client, message, args, data) {
        const channel = message.guild.channels.cache.get(args[0]);
        if (!channel) return message.channel.send("Kanal bulunamadı");
        const points = parseInt(args[1]);
        if (!points) return message.channel.send("Puan belirtmediniz");
        if (channel.type == ChannelType.GuildCategory) {
            const channels = channel.children.filter(c => c.type == ChannelType.GuildText);
            channels.forEach(async c => {
                await client.models.channels.findOneAndUpdate({ meta: { $elemMatch: { id: c.id } } }, { $set: { points: points } }, { upsert: true });
            });
        } else {
            await client.models.channels.findOneAndUpdate({ meta: { $elemMatch: { id: channel.id } } }, { $set: { points: points } }, { upsert: true });
        }
    }
}

module.exports = ClearMessages;