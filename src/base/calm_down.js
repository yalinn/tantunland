console.log(process.argv);
const sl = Number(process.argv.pop());
console.log(sl);
const token = `cd${sl + 1}`;
console.log(token);
let tkc = 1;
while (process.env[`cd${tkc}`]) {
    tkc++;
}
const client = new (require('./classes').Bot)({
    fetchAllMembers: true
}, token);
const { ActivityType } = require('discord.js');
const pm2 = require('pm2');
client.on('ready', async (c) => {
    client.user.setPresence({ status: client.config.cdStatus });
    const guild = client.guilds.cache.get(client.config.guild);
    const sayi = Math.floor(guild.members.cache.size / tkc);
    const array = guild.members.cache.map(m => m).slice((sayi * process.argv.pop()), (sayi * (process.argv.pop() + 1)));
    let i = 0;
    setInterval(async () => {
        const member = array[i];
        if (i === array.length && !member) return pm2.delete(`CD${sl + 1}`);
        client.models.member.findOne({ _id: member.user.id }).then(async (rolesDataOfMember) => {
            if (rolesDataOfMember) {
                let newRoles = [];
                rolesDataOfMember.roles.forEach((r_doc) => {
                    client.models.roles.findOne({ _id: r_doc._id }).then((doc) => {
                        if (guild.roles.cache.has(doc.meta.pop()._id)) newRoles.push(doc.meta.pop()._id);
                    });
                });
                if (i === array.length && !member) return pm2.delete(`CD${sl + 1}`);
                try {
                    //console.log(member.user.tag);
                    await member.roles.add(newRoles).then((m) => {
                        //console.log(m.user.tag);
                        c.user.setActivity({
                            name: `${i} / ${array.length}: ${m.user.tag}`,
                            type: ActivityType.Watching
                        });
                    }).catch(e => console.log(e));
                } catch (error) {
                    console.log(error);
                }
            }
        });
        i = i + 1;
    }, 300);
});
client.on("error", (err) => { console.error(err); });
/* 
- silinen rolleri tespit edip sadece etkilenen kullanıcılara işlem uygulaması için güncellenecek

*/