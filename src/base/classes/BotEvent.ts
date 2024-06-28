import Bot from "./Bot";
import {
    Collection,
    AuditLogEvent,
    GuildAuditLogsEntry,
    GuildAuditLogsResolvable,
    GuildAuditLogsActionType,
    GuildAuditLogsTargetType
} from "discord.js";

export default class BotEvent {
    client: Bot;
    conf: {
        name: any;
        punish: string;
        closePerms: any[];
        action: keyof typeof AuditLogEvent
        sequence: boolean;
    };
    cooldown: Collection<unknown, unknown>;
    isAuthed: boolean;
    data: { roles: {}; channels: {}; };
    lastId: string | null;
    audit: GuildAuditLogsEntry<
        GuildAuditLogsResolvable,
        GuildAuditLogsActionType,
        GuildAuditLogsTargetType,
        GuildAuditLogsResolvable
    >;
    constructor(client: Bot, {
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
            this.run(...args);
        } catch (error) {
            throw error;
        }
    }

    run(...args) {
        throw new Error(`The run method has not been implemented in ${this.conf.name}`);
    }

    fix(...args) {
        throw new Error(`The fix method has not been implemented in ${this.conf.name}`);
    }
}