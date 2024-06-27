const { model, Schema } = require("mongoose");
const { redis } = require("../redis");

const channels = model("meta_channels", new Schema({
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
}));

const stream = channels.watch([]);
stream.on('change', async (data) => {
    console.log(data);
});