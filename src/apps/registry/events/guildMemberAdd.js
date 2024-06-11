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
        const doc = await this.client.models.invites.create({
            guildId: member.guild.id,
            inviterId: inviter,
            invitedId: member.id,
            urlCode: invite ? invite.code : member.guild.vanityURLCode || "",
            left: false,
            message_id: null
        });
        const inviterMember = member.guild.members.cache.get(inviter);
        console.log(`${member.user.tag} katıldı. Davetçisi: ${inviterMember ? inviterMember.user.username : "Sunucu url'si"}`);
        const colors = {
            "member": "#32cd32",
            "guest": "#DFFF00",
            "stranger": "#9acd32",
            "autorol": "#008000"
        }
        const embed = new EmbedBuilder();
        embed.setAuthor({ name: `${member.user.username} [${member.user.id}]`, iconURL: member.user.displayAvatarURL() });
        embed.setFooter({
            text: `Davetçi: ${inviterMember ? inviterMember.user.username : "Sunucu url'si"}`,
            iconURL: inviterMember ? inviterMember.user.displayAvatarURL() : member.guild.iconURL()
        });
        let description_lines = [];
        description_lines.push(`<a:boom:1241402880506728468> Aramıza hoş geldin ${member.user}!`);
        const staff = member.guild.members.cache.filter(m => !m.user.bot && this.client.data.roles["staff"]?.some(r => m.roles.cache.has(r)));
        const staffs = {
            online: staff?.filter(m => m.presence && m.presence.status !== "offline").size,
            in_voice: staff.filter(m => m.voice && m.voice.channel).size,
        }
        if (!inviterMember) {
            const otorol = this.client.data.roles["autorol"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi bulunamadı").catch(console.log);
            }
            embed.setColor(colors["autorol"]);
            description_lines.push(`<a:peace_out:1241402980390141994> Sunucuya katıldığın için teşekkür ederiz. Davetçin bulunamadığı için __kayıtsız__ rolünü aldın.`);
            if (staffs.in_voice > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.in_voice} yetkili seslide, ${staffs.online} yetkili çevrimiçi.`
                );
            } else if (staffs.online > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.online} yetkili çevrimiçi fakat hiçbiri ses kanalında değil.`
                );
            } else {
                description_lines.push(stripIndents`<a:gears_golden:1241402786684473355> Şuan sunucuda aktif yetkili bulunmamaktadır. Yetkililer çevrimdışı olduğunda kayıt olamazsınız.`);
            }
        } else if (inviterMember.user.bot) {
            const otorol = this.client.data.roles["stranger"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi bot").catch(console.log);
            }
            embed.setColor(colors["stranger"]);
            description_lines.push(`<a:peace_out:1241402980390141994> Sunucuya katıldığın için teşekkür ederiz. Site üzerinden katılım sağladığın için __yabancı__ rolünü aldın.`);
            if (staffs.in_voice > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.in_voice} yetkili seslide, ${staffs.online} yetkili çevrimiçi.`
                );
            } else if (staffs.online > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.online} yetkili çevrimiçi fakat hiçbiri ses kanalında değil.`
                );
            } else {
                description_lines.push(stripIndents`<a:gears_golden:1241402786684473355> Şuan sunucuda aktif yetkili bulunmamaktadır. Yetkililer çevrimdışı olduğunda kayıt olamazsınız.`);
            }
        } else if (inviterMember.user.id === member.id) {
            const otorol = this.client.data.roles["stranger"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi kendisi").catch(console.log);
            }
            embed.setColor(colors["stranger"]);
            description_lines.push(`<a:peace_out:1241402980390141994> Sunucuya katıldığın için teşekkür ederiz. Kendi davetinle katıldığın için __yabancı__ rolünü aldın.`);
            if (staffs.in_voice > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.in_voice} yetkili seslide, ${staffs.online} yetkili çevrimiçi.`
                );
            } else if (staffs.online > 0) {
                description_lines.push(
                    stripIndents`Lütfen kayıt olmak için bir yetkiliye ulaşın.
                    <a:gears_golden:1241402786684473355> Sunucuda ${staffs.online} yetkili çevrimiçi fakat hiçbiri ses kanalında değil.`
                );
            } else {
                description_lines.push(stripIndents`<a:gears_golden:1241402786684473355> Şuan sunucuda aktif yetkili bulunmamaktadır. Yetkililer çevrimdışı olduğunda kayıt olamazsınız.`);
            }
        } else if (inviterMember.roles.cache.has(this.client.data.roles["üye"])) {
            const otorol = this.client.data.roles["guest"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi üye").catch(console.log);
            }
            embed.setColor(colors["guest"]);
            description_lines.push(`<a:peace_out:1241402980390141994> Sunucuya katıldığın için teşekkür ederiz. ${inviterMember} tarafından davet edildiği için __misafir__ olarak kayıt edildin`);
        } else if (inviterMember.user.id === member.guild.ownerId) {
            const otorol = this.client.data.roles["member"];
            if (otorol && otorol.length > 0) {
                await member.roles.add(otorol, "davetçisi kurucu").catch(console.log);
                await this.client.models.registry.create({
                    userId: member.user.id,
                    staffId: interaction.user.id,
                    fromRoleId: member_removal
                });
            }
            embed.setColor(colors["member"]);
            description_lines.push(`<a:gears_golden:1241402786684473355> Sunucunun kurucusu tarafından davet edildiğin için otomatik olarak __üye__ olarak kayıt edildin.`);
        }
        embed.setDescription(description_lines.join("\n"));
        const message = await member.guild.channels.cache.get(this.data.channels["welcome"])?.send({
            embeds: [embed]
        });
        if (message) {
            await this.client.models.invites.updateOne({ _id: doc._id }, { $set: { message_id: message.id, channel_id: this.data.channels["welcome"] } });
        }
    }
}

module.exports = GuildMemberAdd;
