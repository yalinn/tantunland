import { Message, time, PermissionsBitField } from 'discord.js';
import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';
export default class MessageDeleteLog extends BotEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "messageDelete"
        })
        this.client = client;
    };

    /**
     * @param {Message} message
     */
    async run(message) {
        const client = message.client;
        if (!message.guild) return;
        if (message.author.bot) return;
        
        this.client.models.chat_logs.create({
            guildId: message.guild.id,
            channelId: message.channel.id,
            userId: message.author.id,
            ex_message: message.content,
            message: null,
            ex_created: message.createdAt,
        });
        
    }
}