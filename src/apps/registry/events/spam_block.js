const { Message } = require('discord.js');
const { ClientEvent, Bot } = require("../../../base/classes");
class SpamBlocker extends ClientEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "messageCreate"
        })
        this.client = client;
    };

    /**
     * @param {Message} message
     */
    async run(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        let cooldown = this.cooldown.get(message.author.id) || [];
        cooldown.push({
            time: Date.now(),
            content: message.content,
            channel: message.channel.id,
            messageID: message.id
        });
        cooldown = cooldown.filter(c => c.time > Date.now() - 1000 * 60);
        this.cooldown.set(message.author.id, cooldown);
        cooldown = this.cooldown.get(message.author.id);
        const logs = cooldown.filter(c => c.channel === message.channel.id && c.content === message.content);
        if (logs.length > 3) {
            await message.member.timeout(1000 * 60 * 60 * 24, "Spam yapma!").catch(console.error);
            const messages = logs.map(l => l.messageID).map(id => message.channel.messages.cache.get(id));
            await message.channel.bulkDelete(messages).catch(console.error);
        }
    }
}
module.exports = SpamBlocker;