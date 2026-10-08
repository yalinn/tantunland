import { Message, time, PermissionsBitField } from 'discord.js';
import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';
export default class MessageUpdateLog extends BotEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "messageUpdate"
        })
        this.client = client;
    };

    /**
     * @param {Message} message
     */
    async run(old, current) {
        const client = old.client;
        if (!old.guild) return;
        if (old.author.bot) return;

        this.client.models.chat_logs.create({
            guildId: old.guild.id,
            channelId: old.channel.id,
            userId: old.author.id,
            ex_message: old.content,
            message: current.content,
            ex_created: old.createdAt,
        });
    }
}