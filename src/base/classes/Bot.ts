import { Guild, ClientOptions, Client, Collection } from "discord.js";
import { sep } from 'path';
const base_dir = __dirname.split(sep).splice(0, __dirname.split(sep).length - 3).join(sep);
require('dotenv').config({ path: base_dir + sep + '.env' });
require('moment').locale('tr');
import { connect, set } from 'mongoose';
const readdir = require("util").promisify(require('fs').readdir);
import { redis } from "./../redis";
import BotEvent from "./BotEvent";
import Responder from "./Responder";
import config from "../config";
import models from "./../models";
import { constants } from "./../types";
export default class Bot extends Client {
    name: string;
    guild: Guild | null;
    baseDir: string;
    base: string;
    config: typeof config;
    models: typeof models;
    appDir: string;
    redis: typeof redis;
    responders: Collection<string, Responder>;
    invites: Collection<unknown, unknown>;
    data: { roles: Record<constants.config_key, string[]>; channels: Record<constants.channel_id, string>; };
    bots: string[];
    constructor(options: ClientOptions, name: string) {
        name = name.split(sep).pop() as string;
        super(options);
        this.name = name;
        this.baseDir = base_dir;
        this.base = __dirname.toString();
        this.config = config;
        this.models = models;
        this.appDir = `${this.baseDir + sep}src${sep}apps${sep + this.name}`;
        this.redis = redis;
        this.loader();
        this.dbConnect();
        this.responders = new Collection();
        this.invites = new Collection();
        this.data = {
            roles: {} as Record<constants.config_key, string[]>,
            channels: {} as Record<constants.channel_id, string>
        };
        this.bots = [];
        this.guild = null;
    }

    getModels() {
        return require("./../models");
    }

    dbConnect() {
        set("strictQuery", false);
        Promise.all([
            connect(this.config.db.mongo, this.config.db.options),
            this.redis.connect(this.config.redis_prefix)
        ]).then(() => {
            console.log("💽 Connected to the databases.");
            //this.initializeData().then(data => this.data = data);
            this.login(process.env["token_" + this.name]);
        }).catch((err) => {
            console.log(`❌ Database connection failed.\n${err}`);
        });
    }

    loader() {
        this.on("error", (e) => console.log(e));
        this.on("warn", (info) => console.log(info));
        readdir(this.baseDir + "/src/events/").then((files: string[]) => {
            files.filter((e) => e.endsWith('.js')).forEach((file) => {
                console.log("EVENT: Loading event: " + file);
                const event = new (require(this.baseDir + "/src/events/" + file))(this) as BotEvent;
                this.on(event.conf.name, (...args) => event.exec(...args));
                delete require.cache[require.resolve(this.baseDir + "/src/events/" + file)];
            });
        }).catch(() => {
            console.log("EVENT: No events found in" + this.name);
        });
        this.loadEvents();
    }

    async getBots() {
        const id_list = await this.redis.get("bots");
        if (id_list) return this.bots;
        return await readdir(this.baseDir + "/src/apps/").then(async (apps: string[]) => {
            const alltokens = apps.map(f => "token_" + f).filter(k => !!process.env[k]).map(k => process.env[k]);
            const tokens = alltokens.filter((t, i) => alltokens.indexOf(t) === i);
            let ids = [];
            for (let i = 0; i < tokens.length; i++) {
                const info = await fetch('https://discord.com/api/users/@me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bot ${tokens[i]}`,
                    },
                }).then(r => r.json()) as { id: string, username: string };
                console.log(`🤝 ${info.username} [${info.id}] is recorded.`);
                ids.push(info.id);
            }
            await this.redis.set("bots", JSON.stringify(ids));
            return ids;
        });
    }

    async setGuild(guildId: string) {
        try {
            const guild = await this.guilds.fetch(guildId);
            this.guilds.cache.filter((g) => g.id !== this.config.guildId).forEach(g => g.leave());
            this.guild = guild;
            return guild;
        } catch (error) {
            console.log({ setGuildError: error });
            return false;
        }
    }

    async initializeData() {
        await this.models.roles.find({ keyConf: { $ne: null } }).then((docs) => {
            docs.forEach((doc) => {
                let values = this.data["roles"][doc.keyConf] || [];
                const roleId = doc.meta.pop().id;
                if (!values.includes(roleId)) this.data["roles"][doc.keyConf] = values.concat([roleId]);
                if (this.guild) this.data["roles"][doc.keyConf] = this.data["roles"][doc.keyConf].filter((id) => this.guild.roles.cache.has(id));
            });
        });
        await this.models.channels.find({ keyConf: { $ne: null } }).then((docs) => {
            docs.forEach((doc) => {
                const channel_id = doc.meta.pop().id;
                if (this.guild && !this.guild.channels.cache.has(channel_id)) {
                    this.models.channels.updateOne({ _id: doc._id }, { $set: { keyConf: null } });
                } else {
                    this.data["channels"][doc.keyConf] = channel_id;
                }
            });
        });
        await this.redis.set("data", this.data);
        return this.data;
    }

    loadEvents(path: string = "") {
        readdir(`${this.appDir}/events/${path || ""}`).then((elements) => {
            return elements.map((element) => {
                let jsFile: BotEvent;
                if (element.endsWith('.js')) {
                    import(this.appDir + `/events/${path ? path + sep + element : element}`).then((file) => {
                        jsFile = new file.default(this);
                        this.on(jsFile.conf.name, (...args) => jsFile.exec(...args));
                        delete require.cache[require.resolve(this.appDir + `/events/${path ? path + sep + element : element}`)];
                        return jsFile.conf.name;
                    }).then((name) => {
                        console.log(`✅ Loaded the event ${name}`);
                    }).catch((error) => {
                        console.log(`❌ Couldn't loaded the event ${element}:\n`, error);
                    }).finally(() => {
                        return jsFile;
                    });
                } else {
                    this.loadEvents(path ? path + sep + element : element);
                }
            });
        }).catch(() => {
            console.log("EVENT: No events found in " + this.name);
        });
    }


    readCommands(path: string = "") {
        readdir(`${this.appDir}/commands/${path || ""}`).then((elements: string[]) => {
            return elements.map(async (element) => {
                let jsFile: Responder | null;
                if (element.endsWith('.js')) {
                    import(this.appDir + `/commands/${path ? path + sep + element : element}`).then((file) => {
                        jsFile = new file.default(this);
                        jsFile.props.path = `${this.appDir}/commands/${path ? path + sep + element : element}`;
                        jsFile.load().then((cmd) => {
                            console.log(`✅ Loaded command ${cmd.conf.name}`);
                        }).catch((error) => {
                            console.log(`❌ Error occured in command ${element}:\n`, error);
                        });
                    }).catch((error) => {
                        console.log(`❌ Couldn't loaded command ${element}:\n`, error);
                        jsFile = null;
                    }).finally(() => {
                        return jsFile;
                    });
                } else {
                    this.readCommands(path ? path + sep + element : element);
                }
            });
        }).catch(() => {
            console.log("DEBUG: No commands found in " + this.name)
        });
    }
}
