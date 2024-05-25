const { Bot, ClientEvent, Responder } = require('../../../base/classes');
const { EmbedBuilder, PermissionFlagsBits, Message } = require('discord.js');

class PrefixCommandCreate extends ClientEvent {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "messageCreate",
            action: null
        });
        this.name = "messageCreate";
        this.client = client;
    }

    /**
     * @param {Message} message
     */
    async run(message) {
        const channelData = this.client.models.channels.findOne({ meta: { $elemMatch: { id: message.channel.id } } });
        const points = channelData.points;
        await this.client.models.user_points.findOneAndUpdate({ userId: message.author.id }, { $inc: { points: points } }, { upsert: true });
    }
}

module.exports = PrefixCommandCreate;
