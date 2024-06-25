const { set, connect } = require("mongoose");
const { EventEmitter } = require("events");
require("dotenv").config();

class Bot extends EventEmitter {
    constructor() {
        super();
        this.redis = require('./redis').redis;
    }
    async start() {
        set("strictQuery", false);
        connect(process.env.mongo_url, {
            authSource: "admin",
            dbName: "Test-fly",
            replicaSet: "rs1",
        }).then(() => {
            this.redis.connect();
            this.emit("ready");
            console.log("Veritabanına başarıyla bağlandı!");
            //this.initializeData().then(data => this.data = data);
            //this.login(process.env["token_" + this.name]);
            //this.getBots().then((bots) => this.bots = bots);
        }).catch((err) => {
            console.log(`Veritabanı bağlantısı başarısız.\nHata:\n${err}`);
        });
    }
}

module.exports = { Bot };