const { createClient } = require("redis");
class Redis {
    constructor({ uri }) {
        this.prefix = null;
        this.client = createClient({
            url: uri
        });
        this.client.on("error", (err) => console.error(err));
        this.client.on("connect", () => console.log("REDIS: Redis connected."));
        this.client.on("reconnecting", () => console.log("REDIS: Redis reconnecting."));
        this.client.on("end", () => console.log("REDIS: Redis disconnected."));
        this.client.on("warning", (err) => console.warn(err));
        this.client.on("close", () => console.log("REDIS: Redis closed."));
    }

    get(key) {
        if (!this.prefix) return Promise.reject(new Error("REDIS: Redis is not connected."));
        if (!key) return Promise.reject(new Error("REDIS: Key is required."));
        return this.client.get(this.prefix + key).then(JSON.parse);
    }

    set(key, value) {
        if (!this.prefix) return Promise.reject(new Error("REDIS: Redis is not connected."));
        if (!key) return Promise.reject(new Error("REDIS: Key is required."));
        if (!value) return Promise.reject(new Error("REDIS: Value is required."));
        return this.client.set(this.prefix + key, JSON.stringify(value), {
            EX: 60 * 60 * 24
        });
    }

    del(key) {
        if (!this.prefix) return Promise.reject(new Error("REDIS: Redis is not connected."));
        if (!key) return Promise.reject(new Error("REDIS: Key is required."));
        return this.client.del(this.prefix + key);
    }

    connect(prefix) {
        this.prefix = prefix + ":";
        return this.client.connect();
    }

}
const redis = new Redis({ uri: process.env.redis_url });
module.exports = { redis };