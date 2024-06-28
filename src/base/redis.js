const { createClient } = require("redis");
class Redis {
    constructor({ uri }) {
        this.prefix = null;
        this.client = createClient({
            url: uri,
            retry_strategy: (options) => {
                if (options.error && options.error.code === "ECONNREFUSED") {
                    return new Error("REDIS: The server refused the connection.");
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error("REDIS: Retry time exhausted.");
                }
                if (options.attempt > 10) {
                    return undefined;
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });
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

    connect(prefix = "none") {
        this.prefix = prefix + ":";
        return this.client.connect()
    }

    disconnect() {
        return this.client.quit();
    }

}
const redis = new Redis({ uri: process.env.redis_url });
module.exports = { redis };