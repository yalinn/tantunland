import { sep } from 'path';
import { ApplicationCommandOption, Collection } from 'discord.js';
import type Bot from './Bot';

enum ResponderType {
    "prefix" = 0,
    "slash" = 1,
    "user" = 2,
    "message" = 3,
    "button" = 4,
    "menu" = 5,
    "modal" = 6
}
type ResponderOptions = {
    customId?: string | null;
    name?: string | null;
    description?: string;
    type?: keyof typeof ResponderType;
    default_member_permissions?: boolean;
    options?: ApplicationCommandOption[];
    enabled?: boolean;
    permissions?: any[];
    time?: number;
    channels: any[];
    aliases: any[];
    devOnly?: boolean;
    adminOnly?: boolean;
    rootOnly?: boolean;
}

export default class Responder {
    client: Bot;
    conf: {
        name: any;
        description: string;
        type: number;
        options: any[];
        default_member_permissions: boolean;
        customId: any;
    };
    props: {
        enabled: boolean;
        permissions: any[];
        time: number;
        channels: any[];
        aliases: any[];
        devOnly: boolean;
        adminOnly: boolean;
        rootOnly: boolean;
        path?: string | null;
    };
    cooldown: Collection<unknown, unknown>;
    shutdown: any;
    constructor(client: Bot, {
        name = null,
        description = "",
        type = "prefix",
        options = [],
        default_member_permissions = false,
        customId = null,
        enabled = true,
        permissions = [],
        time = 5000,
        channels = [],
        aliases = [],
        devOnly = false,
        adminOnly = false,
        rootOnly = false,
    }: ResponderOptions) {
        this.client = client;
        this.conf = {
            name,
            description,
            type: ResponderType[type],
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
            devOnly,
            adminOnly,
            rootOnly,
            path: `${client.appDir}${sep}commands${sep + name}.js`
        };
        this.cooldown = new Collection();
    }

    async load() {
        if (this.conf.type > 0 && this.conf.type < 4) {
            let cmd = this.client.guild.commands.cache.find(c => c.type === this.conf.type && c.name === this.conf.name);
            if (!cmd) {
                cmd = await this.client.guild.commands.create(this.conf);
                this.client.responders.set(cmd.id, this);
            } else {
                this.client.responders.set(cmd.id, this);
            }
            return this;
        } else if (this.conf.type == 4) {
            this.client.responders.set(`component:${this.conf.customId}`, this);
        } else if (this.conf.type == 5) {
            this.client.responders.set(`menu:${this.conf.name}`, this);
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