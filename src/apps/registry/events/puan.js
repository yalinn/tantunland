import Bot from '@/base/classes/Bot';
import BotEvent from '@/base/classes/BotEvent';
import { EmbedBuilder, PermissionFlagsBits, Message } from 'discord.js';

class PrefixCommandCreate extends BotEvent {
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
        if (!channelData || !points) return;
        await this.client.models.user_points.findOneAndUpdate({ userId: message.author.id }, { $inc: { points: points } }, { upsert: true });
    }
}

module.exports = PrefixCommandCreate;
