const config = require("./config.js");
const { model, Schema } = require("mongoose");
const redis = require('./redis').redis;

const temp = model("temp_channel", new Schema({
    guildId: { type: String, default: config.guildId },
    channelId: String,
    userId: String,
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
    versionKey: false
}));

const temp_stream = temp.watch([], { fullDocument: "updateLookup", resumeAfter: undefined });
temp_stream.on("change", async (data) => {
    console.log(data);
    let cnls = await redis.get(`temp_channel`) || [];
    switch (data.operationType) {
        case "insert":
            cnls = [...cnls, data.fullDocument];
            await redis.set(`temp_channel`, cnls);
            break;
        case "delete":
            cnls = cnls.filter(c => c._id !== data.documentKey["_id"].toString());
            await redis.set(`temp_channel`, cnls);
            break;
    }
});

module.exports = {
    temp,
    rolemenu: model("rolemenu", new Schema({
        guildId: { type: String, default: config.guildId },
        rowID: { type: String },
        channelId: String,
        messageId: String,
        customId: String,
        options: [{
            option: String,
            roleKey: String
        }]
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),
    member: model("meta_members", new Schema({
        _id: String,
        guildId: { type: String, default: config.guildId },
        roles: [String],
        names: [{
            username: String,
            displayName: String,
            created: Date,
            claimer: String
        }],
        deleted: Boolean
    }, {
        _id: false,
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),

    banned_tag: model("yasaklitag", new Schema({
        guildId: String,
        tags: Array,
        discriminators: Array
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),

    afk: model("afk_data", new Schema({
        guildId: { type: String, default: config.guildId },
        memberId: String,
        date: Date,
        reason: String,
        status: Boolean
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),

    penalties: model("data_penalty", new Schema({
        guildId: { type: String, default: config.guildId },
        userId: String,
        executor: String,
        reason: String,
        typeOf: String,
        extras: Array,
        until: Date,
        expired: Boolean
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),

    invites: model("stat_invite", new Schema({
        guildId: { type: String, default: config.guildId },
        inviterId: String,
        invitedId: String,
        urlCode: String,
        message_id: { type: String, default: null },
        channel_id: { type: String, default: null },
        left: Boolean
    }, {
        timestamps: {
            created: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
    })),

    registry: model("registry_data", new Schema({
        guildId: { type: String, default: config.guildId },
        userId: String,
        staffId: String,
        fromRoleId: [String],
        disabled: { default: false, type: Boolean }
    }, {
        timestamps: {
            created: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false
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