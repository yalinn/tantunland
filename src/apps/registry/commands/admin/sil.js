const { RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Message } = require('discord.js');
const { Bot, Responder } = require('../../../../base/classes');
const { stripIndent } = require('common-tags');
class ClearMessages extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "sil",
            description: "",
            customId: "mesajsil",
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
        const mentions = message.mentions.users.map(u => u.id);
        const amount = args.find(a => !isNaN(parseInt(a)));
        console.log(amount);
        if (amount > 100) return message.channel.send("100'den fazla mesaj silemem");
        if (amount < 1) return message.channel.send("1'den az mesaj silemem");
        if (mentions.length > 0) {
            const msgs = await message.channel.messages.fetch({ limit: amount });
            const filtered = msgs.filter(m => mentions.includes(m.author.id));
            await message.channel.bulkDelete(filtered, true).catch(console.error);
        } else {
            await message.channel.bulkDelete(amount, true).catch(console.error);
        }

    }
}

module.exports = ClearMessages;