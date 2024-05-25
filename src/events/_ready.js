const { Bot } = require("../base/classes");

class Ready {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        this.name = "ready";
        this.client = client;
    }

    /**
     * @param {Bot} client
     */
    async exec(client) {
        client.guild = await client.setGuild(client.config.guildId);
        if (!client.guild) return console.log("Belirtilen sunucu bulunamadı.");
        client.bots = await client.getBots();
        console.log(`${client.user.tag}, ${client.guild.name} için ${client.bots.length} aktif edildi.`);
        client.readCommands();
        await client.initializeData();
        client.emit("_ready", client);
    }
}
module.exports = Ready;
