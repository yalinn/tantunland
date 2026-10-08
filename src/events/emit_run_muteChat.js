const { ClientEvent } = require('../base/utils');
class EmitRunMuteC extends ClientEvent {
    constructor(client) {
        super(client, {
            name: "cmute"
        });
        this.client = client;
    }
    async run({ targetId, executorId, reason, duration, note }) {
        const member = this.client.guild.members.cache.get(targetId);
        await member.roles.add(this.data.roles["muted"]);
        if (duration === "p") duration = null;
        let check = await this.client.models.penalties.findOne({ userId: userId, typeOf: "CMUTE" });
        if (!check) check = await this.client.models.penalties.create({
            userId: targetId,
            executor: executorId,
            reason: reason,
            extras: [],
            typeOf: "CMUTE",
            until: duration ? require('moment')(new Date()).add(`${duration}m`).toDate() : null,
            created: new Date()
        });
        const docum = check;
        if (!duration) await this.client.models.penalties.updateOne({ _id: docum._id }, {
            $push: {
                extras: [
                    {
                        subject: "perma",
                        data: true
                    }
                ]
            }
        });
        if (note) await this.client.models.penalties.updateOne({ _id: docum._id }, {
            $push: {
                extras: [
                    {
                        subject: "note",
                        data: note
                    }
                ]
            }
        });
    }
}
module.exports = EmitRunMuteC;
