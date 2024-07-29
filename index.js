const { Bot } = require('./src/base/bot');
const { xd, asd } = require("./src/base/models/xd");
const client = new Bot();
const { redis } = require('./src/base/redis');
console.log("Started");
client.on("ready", async () => {
  //const x = await xd.create({ xd: "deneme" });
  //await redis.set(`xd:${x._id}`, x);
  setTimeout(async () => {
    await xd.create({ xd: "deneme", meta: [{ id: "deneme" }], keyConf: "deneme" });
    //const data = await redis.get(`xd:${x._id}`);
    //console.log({ data });
  }, 2000);
  console.log("Ready");
});

client.start(); 