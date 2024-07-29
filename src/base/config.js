module.exports = {
    prefix: [".", "!"],
    guildId: "1146235982149062846",
    developers: [
        "942697809080111145",
    ],
    redis_prefix: process.env.redis_prefix || "ttl",
    db: {
        mongo: process.env.mongo_url,
        redis: process.env.redis_url,
        options: {
            authSource: process.env.mongo_auth_db || "admin",
            dbName: process.env.mongo_db || "discord",
            replicaSet: process.env.mongo_replica_set || "rs1",
        }
    },
    roots: [

    ]
}