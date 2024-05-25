const { GuildMember } = require('discord.js');
const { ClientEvent, Bot } = require("../../../base/classes");
class GuildMemberRemove extends ClientEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "guildMemberRemove"
        })
        this.client = client;
    }

    /**
     * @param {GuildMember} member
     */
    async run(member) {
        await this.client.models.invites.updateMany({ invitedId: member.id, guildId: member.guild.id, left: false }, { $set: { left: true } });
        await this.client.models.member.updateMany({ memberId: member.id, guildId: member.guild.id, expired: false }, { $set: { roles: [] } });
    }
}
module.exports = GuildMemberRemove;