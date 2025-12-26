import { model, Schema } from "mongoose";
import { redis } from "../redis";

const roles = model("meta_roles", new Schema({
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
}, {
    strict: false
}));