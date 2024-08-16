module.exports = {
    prefix: [".", "!"],
    guildId: process.env.guild_id || "468091193486606337",
    developers: [
        "942697809080111145",
    ],
    redis_prefix: process.env.redis_prefix || "gucciterlik",
    db: {
        mongo: process.env.mongo_url,
        redis: process.env.redis_url,
        options: {
            authSource: process.env.mongo_auth_db || "admin",
            dbName: process.env.mongo_db || "gucciterlik",
            replicaSet: process.env.mongo_replica_set || "rs1",
        }
    },
    roots: [

    ]
}