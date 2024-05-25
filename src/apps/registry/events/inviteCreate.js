const { Invite } = require('discord.js');
const { ClientEvent, Bot } = require("../../../base/classes");
class InviteCreate extends ClientEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "inviteCreate"
        })
        this.client = client;
    };

    /**
     * @param {Invite} invite
     */
    async run(invite) {
        this.client.invites = await invite.guild.invites.fetch();
        await this.client.guild.invites.fetch().then(async (invites) => {
            await this.client.redis.set(`inv_guild:${invite.guild.id}`, JSON.stringify(invites));
        });
    }
}
module.exports = InviteCreate;