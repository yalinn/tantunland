const { Message } = require('discord.js');
const { ClientEvent, Bot } = require("../../../base/classes");
class LinkBlockerUpdate extends ClientEvent {

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
     * @param {Message} oldMsg
     * @param {Message} message
     */
    async run(oldMsg, message) {
        const client = message.client;
        if (!message.guild) return;
        if (message.author.bot) return;
        const elebaşı = ["discord.gg/", "discord.com/invite/", "discordapp.com/invite/", "discord.me/"];
        if (message.member.permissions.has("ADMINISTRATOR")) return;
        if (message.guild && elebaşı.some(link => message.content.includes(link))) {
            for (let c = 0; c < elebaşı.length; c++) {
                message.content.split(" ").filter(s => s.includes(elebaşı[c])).map(s => s.split(elebaşı[c]).pop()).forEach(async (code) => {
                    try {
                        const reklam = await client.fetchInvite(code);
                        if (!reklam || !reklam.guild) {
                            await message.delete();
                        }
                        if (reklam.guild.id !== message.guild.id) {
                            await message.member.timeout(1000 * 60 * 60 * 24, "Reklam yapma!").catch(console.error);
                            await message.delete();
                        }
                    } catch (error) {
                        console.log("Unkown invite link.")
                        await message.member.timeout(1000 * 60 * 60 * 24, "Reklam yapma!").catch(console.error);
                        await message.delete();
                    }
                });
            }
        }
    }
}
module.exports = LinkBlockerUpdate;