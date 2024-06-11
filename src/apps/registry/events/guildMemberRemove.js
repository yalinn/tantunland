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
        const memberData = await this.client.models.member.findOne({ _id: member.id });
        await this.client.models.member.updateOne({ _id: member.id }, { $set: { roles: [] } });
        const inviteData = await this.client.models.invites.findOne({ memberId: member.id, guildId: member.guild.id, left: false });
        if (!inviteData) return;
        await this.client.models.invites.updateMany({ invitedId: member.id, guildId: member.guild.id, left: false }, { $set: { left: true } });
        if (!memberData) return;
        const colors = {
            member: "#ff0000",
            guest: "#FF8C69",
            stranger: "#ff5349",
            autorole: "#800000",
        }
        const the_role = Object.keys(colors).find(r => member.roles.cache.has(this.client.data.roles[r]));
        if (!the_role) return;
        const welcome_channel = member.guild.channels.cache.get(inviteData.channel_id);
        if (!welcome_channel) return;
        const message = await welcome_channel.messages.fetch(inviteData.message_id);
        if (!message) return;
        const embed = message.embeds[0];
        embed.setColor(colors[the_role]);
        await message.edit({ embeds: [embed] });
    }
}
module.exports = GuildMemberRemove;