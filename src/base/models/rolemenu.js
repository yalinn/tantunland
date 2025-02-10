import { model, Schema } from "mongoose";
import { redis } from "../redis";

const rolemenu =  model("rolemenu", new Schema({
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
}))

export default rolemenu;