const { GuildMember, Embed, EmbedBuilder } = require('discord.js');
const { Bot, ClientEvent } = require('../../../base/classes');

class GuildMemberAdd extends ClientEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "guildMemberAdd"
        })
        this.client = client;
    }

    /**
     * @param {GuildMember} member
     */
    async run(member) {
        if (member.guild.id !== this.client.config.guildId) return;

        const gInvites = await member.guild.invites.fetch({ cache: false })
        const invite = this.client.invites.find((inv) => inv.uses < gInvites.get(inv.code)?.uses || !gInvites.has(inv.code));
        await member.guild.invites.fetch().then(async (invites) => {
            await this.client.redis.set(`inv_guild:${member.guild.id}`, JSON.stringify(invites.map(i => ({
                uses: i.uses,
                code: i.code,
                inviterId: i.inviterId
            }))));
        });
        console.log(invite)
        let inviter = invite ? invite.inviterId : "VANITY_URL";
        await this.client.models.invites.create({
            guildId: member.guild.id,
            inviterId: inviter,
            invitedId: member.id,
            urlCode: invite ? invite.code : member.guild.vanityURLCode || "",
            left: false
        });
        const inviterMember = member.guild.members.cache.get(inviter);
        console.log(`${member.user.tag} katıldı. Davetçisi: ${inviterMember ? inviterMember.user.tag : "VANITY_URL"}`);
        if (!inviterMember) {
            const otorol = this.client.data.roles["autorol"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi bulunamadı").catch(e => console.log(e));
            }
        } else if (inviterMember.user.bot) {
            const otorol = this.client.data.roles["stranger"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi bot").catch(e => console.log(e));
            }
        } else if (inviterMember.user.id === member.id) {
            const otorol = this.client.data.roles["stranger"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi kendisi").catch(e => console.log(e));
            }
        } else if (inviterMember.roles.cache.has(this.client.data.roles["üye"])) {
            const otorol = this.client.data.roles["guest"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi üye").catch(e => console.log(e));
            }
        } else if (inviterMember.user.id === member.guild.ownerId) {
            const otorol = this.client.data.roles["member"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi kurucu").catch(e => console.log(e));
            }
        }




    }
}

module.exports = GuildMemberAdd;
