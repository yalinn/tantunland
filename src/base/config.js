module.exports = {
    prefix: [".", "!"],
    guildId: "1146235982149062846",
    developers: [   // tekrardan root'a eklemeye gerek yok
        "942697809080111145", 
    ],
    db: {
        mongo: process.env.mongo_url,
        redis: process.env.redis_url,
        options: {
            authSource: "admin",
            dbName: "Tantunland",
            //replicaSet: "rs1",
        }
    },
    roots: [        // her işlem için izinli id'ler

    ]
}