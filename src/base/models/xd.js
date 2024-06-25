const { model, Schema } = require("mongoose");
const redis = require('../redis').redis;
const xdSchema = new Schema({
    xd: String
});

const asdSchema = new Schema({
    asd: String,
    keyConf: String,
    meta: [{ id: String }]
});

const asd = model("asd", asdSchema);

const xd = model("xd", xdSchema);
const stream = xd.watch([
    /* {
        "$match": {
            "fullDocument.test": { "$ne": null }
        }
    } */
], { fullDocument: "updateLookup", resumeAfter: undefined });
stream.on('change', async (data) => {
    const cnls = await redis.get(`xd`) || {};
    const keys = Object.keys(cnls);
    switch (data.operationType) {
        case "insert":
            const meta = data.fullDocument.meta?.pop();
            const keyConf = data.fullDocument.keyConf;
            if (!meta || !meta.id || !keyConf) return;
            cnls[data.fullDocument["keyConf"]] = meta.id;
            redis.set(`xd`, cnls);
            break;
        case "update":
            if (!!data.fullDocument["keyConf"]) {
                const meta = data.fullDocument.meta.pop();
                const oldMeta = data.fullDocument.meta.pop();
                const keyConf = data.fullDocument.keyConf;
                if (!meta || !meta.id || !keyConf) return;
                if (keys.find(k => cnls[k] === oldMeta.id)) {
                    delete cnls[keys.find(k => cnls[k] === oldMeta.id)];
                }
                if (keys.find(k => cnls[k] === meta.id)) {
                    delete cnls[keys.find(k => cnls[k] === meta.id)];
                }
                cnls[data.fullDocument["keyConf"]] = meta.id;
                redis.set(`xd`, cnls);
            } else {
                const meta = data.fullDocument.meta.pop();
                const oldMeta = data.fullDocument.meta.pop();
                if (!meta || !meta.id || !oldMeta.id) return;
                if (keys.find(k => cnls[k] === oldMeta.id)) {
                    delete cnls[keys.find(k => cnls[k] === oldMeta.id)];
                }
                if (keys.find(k => cnls[k] === meta.id)) {
                    delete cnls[keys.find(k => cnls[k] === meta.id)];
                }
                redis.set(`xd`, cnls);
            }
            break;
        case "delete":
            const replaced = []
            break;
    }
    const cnlss = await redis.get(`xd`) || {};
    console.log({ cnls, cnlss });
});

module.exports = { xd, asd };