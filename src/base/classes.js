const { sep } = require('path');
const base_dir = __dirname.split(sep).splice(0, __dirname.split(sep).length - 3).join(sep);
console.log(base_dir);
require('dotenv').config({ path: base_dir + sep + '.env' });
require('moment').locale('tr');
const { Collection, AuditLogEvent } = require('discord.js');
import Bot from './classes/Bot';
export class ClientEvent {
    /**
     * @param {Bot} client
     */
    constructor(client, {
        name = null,
        action = null,
        punish = "jail",
        closePerms = [],
        sequence = false
    }) {
        this.client = client;
        this.conf = {
            name,
            punish,
            closePerms,
            action,
            sequence
        }
        this.cooldown = new Collection();
        this.data = {
            roles: {},
            channels: {}
        }
        this.isAuthed = false;
        this.lastId = null;
    }

    async exec(...args) {
        this.data = await this.client.redis.get("data");
        if (this.conf.action) {
            this.isAuthed = await this.client.guild.fetchAuditLogs({ type: AuditLogEvent[this.conf.action] }).then(async (audit) => {
                this.audit = audit.entries.first();
                if (this.client.config.developers.concat(this.client.config.roots).includes(this.audit.executorId)) return true;
                if (this.client.bots.includes(this.audit.executorId)) return true;
                const docs = await this.client.redis.get(`atl_authorized:${this.audit.executorId}`).then((raw) => JSON.parse(raw));
                if (!docs || docs.length == 0) return false;
                const accure = docs.filter((prm) => prm.until && prm.until.getTime() - new Date().getTime() > 0);
                await this.client.redis.set(`atl_authorized:${this.audit.executorId}`, JSON.stringify(accure));
                if (accure.length == 0) return false;
                const prim = accure.findIndex((prm) => prm.action === this.conf.action);
                if (!accure[prim]) return false;
                const accured = accure.slice(0, prim).concat(accure.slice(prim + 1));
                await this.client.redis.set(`atl_authorized:${this.audit.executorId}`, JSON.stringify(accured));
                return true;
            });
            if (this.lastId === this.audit.id) return;
            this.lastId = this.audit.id;
            if (!this.isAuthed) {
                if (this.audit.createdTimestamp <= Date.now() - 5000) return;
                if (this.conf.closePerms.length > 0) {
                    await Promise.all(this.client.guild.roles.cache.filter((role) => {
                        return role.permissions.toArray().some(perm => this.conf.closePerms.includes(perm));
                    }).map((role) => {
                        return role.setPermissions(role.permissions.remove(this.conf.closePerms).bitfield);
                    }));
                }
                if (this.conf.punish && this.audit.executor) {
                    this.client.emit(this.conf.punish, {
                        targetId: this.audit.executorId,
                        executorId: this.client.user.id,
                        reason: this.conf.action,
                        duration: "p",
                        note: `auditId: ${this.audit.id}`
                    });
                }
                try {
                    this.fix(...args);
                } catch (error) {
                    throw error;
                }
                return;
            }
        };
        try {
            await this.run(...args);
        } catch (error) {
            throw error;
        }
    }
}


export class Responder {
    /**
     * @param {Bot} client
     */
    constructor(client, {
        name = null,
        description = "",
        type = 0,
        /* 
        type = 0, prefix
        type = 1, slash
        type = 2, user
        type = 3, message
        type = 4, Button
        type = 5, Menu
        type = 6, Modal
        */
        options = [],
        default_member_permissions = false,
        customId = null,
        enabled = true,
        permissions = [],
        time = 5000,
        channels = [],
        aliases = [],
        flag = false,
        devOnly = false,
        path = null,
        adminOnly = false,
        rootOnly = false
    }) {
        this.client = client;
        this.conf = {
            name,
            description,
            type,
            options,
            default_member_permissions,
            customId
        };
        this.props = {
            enabled,
            permissions,
            time,
            channels,
            aliases,
            flag,
            devOnly,
            adminOnly,
            rootOnly,
            path
        };
        this.cooldown = new Collection();
    }

    async load() {
        if (this.conf.type > 0 && this.conf.type < 4) {
            let cmd = this.client.guild.commands.cache.find(c => c.type === this.conf.type && c.name === this.conf.name);
            if (!cmd) {
                console.log(`${this.props.flag || ""} komutu oluşturuluyor: ${this.conf.name} 👌`);
                cmd = await this.client.guild.commands.create(this.conf, this.client.guild.id);
                this.client.responders.set(cmd.id, this);
            } else {
                this.client.responders.set(cmd.id, this);
            }
            return this;
        } else if (this.conf.type >= 4 && this.conf.type < 6) {
            this.client.responders.set(`component:${this.conf.customId}`, this);
        } else if (this.conf.type == 6) {
            this.client.responders.set(`modal:${this.conf.name}`, this);
        } else {
            this.client.responders.set(`prefix:${this.conf.name}`, this);
        }
        return this;
    }

    async reload() {
        let that = this.client.responders.find(r => r.conf.name === this.conf.name);
        let cmd = this.client.guild.commands.cache.find(c => c.name === this.conf.name);
        await cmd.edit(that.conf);
    }
    async unload() {
        if (this.shutdown) {
            await this.shutdown(this.client);
        }
        delete require.cache[require.resolve(this.props.path)];
        return this;
    }

}