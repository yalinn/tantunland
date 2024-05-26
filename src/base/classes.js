const { sep } = require('path');
const base_dir = __dirname.split(sep).splice(0, __dirname.split(sep).length - 2).join(sep);
require('dotenv').config({ path: base_dir + sep + '.env' });
require('moment').locale('tr');
const { createClient } = require('redis');
const {
    Client,
    Collection,
    AuditLogEvent,
    UserSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');
const {
    connect,
    set
} = require('mongoose');
const readdir = require("util").promisify(require('fs').readdir);

class Bot extends Client {
    constructor(options, name) {
        name = name.split(sep).pop();
        super(options);
        this.name = name;
        this.baseDir = base_dir;
        this.base = __dirname.toString();
        this.config = this.getConfig();
        this.models = this.getModels();
        this.appDir = `${this.baseDir + sep}src${sep}apps${sep + this.name}`;
        this.redis = createClient({
            url: this.config.db.redis
        });
        this.loader();
        this.dbConnect();
        this.responders = new Collection();
        this.invites = new Collection();
        this.data = {
            roles: {},
            channels: {}
        }
    }

    getConfig() {
        return require("./config");
    }

    getModels() {
        return require("./models");
    }

    dbConnect() {
        this.redis.connect().then(() => {
            console.log("redis bağlantısı kuruldu")
        });
        set("strictQuery", false);
        connect(this.config.db.mongo, this.config.db.options).then(() => {
            console.log("Veritabanına başarıyla bağlandı!");
            //this.initializeData().then(data => this.data = data);
            this.login(process.env["token_" + this.name]);
            //this.getBots().then((bots) => this.bots = bots);
        }).catch((err) => {
            console.log(`Veritabanı bağlantısı başarısız.\nHata:\n${err}`);
        });
    }

    loader() {
        this.on("error", (e) => console.log(e));
        this.on("warn", (info) => console.log(info));
        readdir(this.baseDir + "/src/events/").then((files) => {
            files.filter((e) => e.endsWith('.js')).forEach((file) => {
                console.log("loading event: " + file);
                const event = new (require(this.baseDir + "/src/events/" + file))(this);
                console.log(`Loading Event:( ${event.name} )`);
                this.on(event.name, (...args) => event.exec(...args));
                delete require.cache[require.resolve(this.baseDir + "/src/events/" + file)];
            });
        });
        this.loadEvents();
    }

    /**
     * @returns {Promise<string[]>}
     */
    async getBots() {
        let ids = [];
        await readdir(this.baseDir + "/src/apps/").then(async (apps) => {
            const tokens = apps.filter(name => !!process.env["token_" + name]).map(name => process.env[name]);
            for (let i = 0; i < tokens.length; i++) {
                const info = await fetch('https://discord.com/api/users/@me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bot ${tokens[i]}`,
                    },
                }).then(r => r.json());
                ids.push(info.id);
            }
        });
        return ids;
    }

    async setGuild(guildId) {
        try {
            const guild = await this.guilds.fetch(guildId);
            this.guilds.cache.filter((g) => g.id !== this.config.guildId).forEach(g => g.leave());
            this.guild = guild;
            return guild;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async initializeData() {
        await this.models.roles.find({ keyConf: { $ne: null } }).then((docs) => {       // "$ne" = "(N)ot (E)quals to"
            docs.forEach((doc) => {
                let values = this.data["roles"][doc.keyConf] || [];
                this.data["roles"][doc.keyConf] = values.concat([doc.meta.pop()._id]);
                if (this.guild) this.data["roles"][doc.keyConf] = this.data["roles"][doc.keyConf].filter((id) => this.guild.roles.cache.has(id));
            });
        });
        await this.models.channels.find({ keyConf: { $ne: null } }).then((docs) => {    // "$ne" = "(N)ot (E)quals to"
            docs.forEach((doc) => {
                if (this.guild && !this.guild.channels.cache.has(doc.meta.pop().id)) {
                    this.models.channels.updateOne({ _id: doc._id }, { $keyConf: null });
                } else {
                    this.data["channels"][doc.keyConf] = doc.meta.pop().id;
                }
            });
        });
        await this.redis.set("ttl_id_data", JSON.stringify(this.data));
        this.data = await this.redis.get("ttl_id_data").then((raw) => JSON.parse(raw));
        return this.data;
    }

    loadEvents(path) {
        readdir(`${this.appDir}/events/${path || ""}`).then((elements) => {
            return elements.map((element) => {
                let jsFile;
                if (element.endsWith('.js')) {
                    try {
                        jsFile = new (require(this.appDir + `/events/${path ? path + sep + element : element}`))(this);
                        this.on(jsFile.conf.name, (...args) => jsFile.exec(...args));
                        delete require.cache[require.resolve(this.appDir + `/events/${path ? path + sep + element : element}`)];
                    } catch (error) {
                        console.log(`❌ Couldn't loaded the event ${element}:\n`, error);
                    } finally {
                        return jsFile;
                    }
                } else {
                    this.loadEvents(path ? path + sep + element : element);
                }
            });
        }).catch((e) => {
            console.log("event bulunmuyor.")
        });
    }


    readCommands(path) {
        readdir(`${this.appDir}/commands/${path || ""}`).then((elements) => {
            return elements.map(async (element) => {
                let jsFile;
                if (element.endsWith('.js')) {
                    try {
                        jsFile = new (require(this.appDir + `/commands/${path ? path + sep + element : element}`))(this);
                        jsFile.props.path = `${this.appDir}/commands/${path ? path + sep + element : element}`;
                        await jsFile.load()
                        return jsFile;
                    } catch (error) {
                        console.log(`❌ Couldn't loaded command ${element}:\n`, error);
                        jsFile = false;
                    } finally {
                        return jsFile;
                    }
                } else {
                    this.readCommands(path ? path + sep + element : element);
                }
            });
        }).catch((e) => {
            console.log("komut bulunmuyor.")
        });
    }

}

class ClientEvent {
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
        //this.data = await this.client.redis.get("atl_id_data").then((raw) => JSON.parse(raw));
        this.data = this.client.initializeData();
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
}


class Responder {
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

module.exports = {
    Bot,
    ClientEvent,
    Responder
}