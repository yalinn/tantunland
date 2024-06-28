const { model, Schema } = require("mongoose");
const { redis } = require("../redis");

const members = model("members", new Schema({
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
}));
const stream = members.watch([], { fullDocument: "updateLookup", resumeAfter: undefined });
stream.on('change', async (data) => {
    switch (data.operationType) {
        case "insert":
            redis.set(`member:${data.fullDocument._id}`, JSON.stringify(data.fullDocument));
            break;
        case "update":
            redis.set(`member:${data.fullDocument._id}`, JSON.stringify(data.fullDocument));
            break;
        case "delete":
            redis.del(`member:${data.documentKey._id}`);
            break;
    }
});