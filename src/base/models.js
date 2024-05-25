const { escapeNumberedList } = require("discord.js");
const { model, Schema } = require("mongoose");



module.exports = {
    sunucu: model("server_data", new Schema({
        guildId: String,
        tag: String,
        untag: String,
        otoregister: Boolean,
        taglı: Boolean,
        register: Boolean
    })),
    member: model("meta_members", new Schema({
        _id: String,
        roles: [String],
        names: [{       // Tag aldırma olayı
            username: String,
            displayName: String,
            created: Date,
            claimer: String
        }],
        registries: [{  //  kayıt sayacı
            created: Date,
            executor: String,
            gender: String,
            age: String
        }],
        deleted: Boolean
    }, { _id: false })),
    banned_tag: model("yasaklitag", new Schema({
        guildId: String,
        tags: Array,
        discriminators: Array
    })),
    snipe: model("snipe", new Schema({
        guildId: String,
        channelId: String,
        userId: String,
        message: String,
        send: Number,
        deleted: Number,
    })),
    afk: model("afk_data", new Schema({
        guildId: String,
        memberId: String,
        date: Date,
        reason: String,
        status: Boolean
    })),
    commandblock: model("block_commands", new Schema({
        guildId: String,
        cb: Array
    })),
    penalties: model("data_penalty", new Schema({
        userId: String,
        executor: String,
        reason: String,
        typeOf: String,
        extras: Array,
        until: Date,
        expired: Boolean
    }, {
        timestamps: {
            createdAt: "created"
        }
    })),
    invites: model("stat_invite", new Schema({
        guildId: String,
        inviterId: String,
        invitedId: String,
        urlCode: String,
        left: Boolean
    }, {
        timestamps: {
            created: "created",
            updatedAt: "leftDate"
        }
    })),
    register: model("register_data", new Schema({
        guildId: String,
        userId: String,
        user: Array,
        rol: Array,
        name: Array,
        top: Number,
        default: String
    })),
    punishment: model("Punishment", new Schema({
        guildId: String,
        userId: String,
        topunish: Number,
        ban: Number,
        punishpoint: Number,
        mute: Number,
        vmute: Number,
        jail: Number,
        underwold: Number,
        mutestatus: Boolean,
        allstatus: Boolean,
        vmutestatus: Boolean,
        jailstatus: Boolean,
        underwoldstatus: Boolean
    })),
    penals: model("Penals", new Schema({
        penalid: Number,
        guildId: String,
        userId: String,
        type: String,
        status: Boolean,
        staff: String,
        reason: String,
        end: Date,
        date: Date
    })),

    roles: model("meta_roles", new Schema({
        keyConf: String,
        commands: [String],
        meta: [{
            _id: String,
            name: String,
            icon: String,
            color: String,
            hoist: Boolean,
            mentionable: Boolean,
            position: Number,
            bitfield: String,
            created: Date,
            emoji: String
        }],
        deleted: Boolean,
        emojis: [String]
    })),
    channels: model("meta_channels", new Schema({
        keyConf: String,
        type: Number,
        parentId: String,
        meta: Array,
        points: Number,
        overwrites: [{
            _id: String,
            typeOf: Number,
            deny: [String],
            allow: [String]
        }],
        deleted: Boolean,
        extras: Array
    }, {
        strict: false
    })),
    user_points: model("user_points", new Schema({
        guildId: String,
        userId: String,
        points: Number
    })),
    chat_logs: model("chat_logs", new Schema({
        guildId: String,
        channelId: String,
        userId: String,
        message: String,
        date: Date
    })),
}