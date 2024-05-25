const { GuildMember } = require("discord.js");
const { ClientEvent, Bot } = require("../../../base/classes");
const pm2 = require("pm2");
const { modPerms } = require("../../../base/constants");

class GuildMemberUpdate extends ClientEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "guildMemberUpdate",
            action: "MemberRoleUpdate",
            sequence: false,
            punish: null
        })
        this.client = client;
    }


    /**
     * @param {GuildMember} member 
     * @param {GuildMember} prev 
     */
    async run(prev, member) {
        const client = this.client;
        if (member.guild.id !== client.config.guildId) return;
        let ohal = false;
        pm2.list((err, list) => {
            if (err) return;
            ohal = list.map(item => item.name).filter(item => item.startsWith("CD")).length > 0;
        });
        if (!ohal) {
            let roles = member.roles.cache.map((r) => r.id);
            const model = await client.models.member.findOne({ _id: member.user.id });
            if (!model) {
                await client.models.member.create({
                    _id: member.user.id,
                    roles
                });
            } else {
                await client.models.member.updateOne({ _id: member.user.id }, { $set: { roles } });
            }
            //console.log(`${this.audit.executor.username} => [${this.audit.changes[0].key}] ${this.audit.target.username} : ${this.audit.changes[0].new[0].name}`);
        }
    }

    /**
     * @param {GuildMember} member 
     * @param {GuildMember} prev 
     */
    async fix(prev, member) {
        const alınan = prev.roles.cache.filter(r => !member.roles.cache.has(r.id)).filter(r => modPerms.some(perm => r.permissions.has(perm))).map(r => r.name);
        const verilen = member.roles.cache.filter(r => !prev.roles.cache.has(r.id)).filter(r => modPerms.some(perm => r.permissions.has(perm))).map(r => r.name);
        if (alınan.length == 0 && verilen.length == 0) return await this.run(prev, member);
        const executor = member.guild.members.cache.get(this.audit.executorId);
        if (executor.roles.highest.rawPosition > member.guild.members.me.roles.highest.rawPosition) return await this.run(prev, member);;
        const roleSet = executor.roles.cache.filter(r => modPerms.some(perm => r.permissions.has(perm) && r.id !== prev.guild.roles.premiumSubscriberRole)).map(r => r.id);
        await executor.roles.remove(roleSet);
        this.client.emit("jail", {
            targetId: this.audit.executorId,
            executorId: this.client.user.id,
            reason: this.conf.action,
            duration: "p",
            note: `auditId: ${this.audit.id}`
        });
        let roles = prev.roles.cache.map((r) => r.id);
        await member.roles.set(roles);
        await member.guild.members.fetch();
    }
}
module.exports = GuildMemberUpdate;
