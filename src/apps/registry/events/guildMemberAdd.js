const { GuildMember, Embed, EmbedBuilder } = require('discord.js');
const { Bot, ClientEvent } = require('../../../base/classes');
const { stripIndents } = require('common-tags');

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
            this.client.invites = invites;
            await this.client.redis.set(`inv_guild:${member.guild.id}`, JSON.stringify(invites.map(i => ({
                uses: i.uses,
                code: i.code,
                inviterId: i.inviterId
            }))));
        });
        let inviter = invite ? invite.inviterId : "VANITY_URL";
        await this.client.models.invites.create({
            guildId: member.guild.id,
            inviterId: inviter,
            invitedId: member.id,
            urlCode: invite ? invite.code : member.guild.vanityURLCode || "",
            left: false
        });
        const inviterMember = member.guild.members.cache.get(inviter);
        console.log(`${member.user.tag} katıldı. Davetçisi: ${inviterMember ? inviterMember.user.username : "Sunucu url'si"}`);
        /* const colors = {
            "member": "#2ecc71",
            "guest": "#3498db",
            "stranger": "#f1c40f",
            "autorol": "#e74c3c"
        } */
        const staff = member.guild.members.cache.filter(m => !m.user.bot && this.client.data.roles["staff"]?.some(r => m.roles.cache.has(r)));
        const staffs = {
            online: staff?.filter(m => m.presence && m.presence.status !== "offline").size,
            in_voice: staff.filter(m => m.voice && m.voice.channel).size,
        }
        let inviterLine = inviterMember && inviterMember.roles.cache.has(this.client.data.roles["üye"])
            ? `**${inviterMember.username}** tarafından davet edildiğin için sana __Misafir__ rolünü verdik.`
            : inviterMember && inviterMember.user.id === member.guild.ownerId
                ? "Sunucunun kurucusu tarafından davet edildiğin için otomatik olarak __üye__ olarak kayıt edildin."
                : inviterMember && inviterMember.user.id === member.id
                    ? "Kendi davetinle katıldığın için __yabancı__ rolünü aldın."
                    : inviter === "VANITY_URL"
                        ? "Sunucu url'si üzerinden katıldın."
                        : inviterMember && inviterMember.user.bot
                            ? "Bir bot tarafından davet edildiğin için __yabancı__ rolünü aldın."
                            : "Sunucuya katıldığın için teşekkür ederiz. Davetçin bir üye olmadığı için __kayıtsız__ rolünü aldın."

        let isregistered = inviterMember && !inviterMember.user.bot && inviterMember.user.id !== member.id && inviterMember.roles.cache.has(this.client.data.roles["üye"]);
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
        let registerLine = "Sunucunun kurucusu tarafından davet edildiğin için otomatik olarak __üye__ olarak kayıt edildin.";
        if (!isregistered) {
            if (staffs.in_voice > 0) {
                registerLine = `Sunucuda ${staffs.in_voice} yetkili seslide, ${staffs.online} yetkili çevrimiçi.`
            } else if (staffs.online > 0) {
                registerLine = `Sunucuda ${staffs.online} yetkili çevrimiçi fakat hiçbiri ses kanalında değil.`
            } else {
                registerLine = `Şuan sunucuda aktif yetkili bulunmamaktadır. Yetkililer çevrimdışı olduğunda kayıt olamazsınız.`;
            }
        }
        await member.guild.channels.cache.get(this.data.channels["welcome"]).send({
            content: stripIndents`
            <a:boom:1241402880506728468> ${member.user} \`${member.user.id}\` sunucuya katıldı.
            <a:peace_out:1241402980390141994> Sunucuya katıldığın için teşekkür ederiz. ${inviterLine}
            <a:gears_golden:1241402786684473355> ${registerLine}
            `,
        });
    }
}

module.exports = GuildMemberAdd;
