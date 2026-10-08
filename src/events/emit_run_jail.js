const { ClientEvent } = require('../base/utils');

class EmitRunJail extends ClientEvent {
    constructor(client) {
        super(client, {
            name: "jail"
        });
        this.client = client;
    };

    async run({ targetId, executorId, reason, duration, note }) {
        const member = this.client.guild.members.cache.get(targetId);
        const memberRoles = member.roles.cache.filter(role => role.id !== this.data.roles["booster"]).map(role => role.id);
        await member.roles.remove(memberRoles);
        await member.roles.add(this.data.roles["prisoner"]);
        if (duration === "p") duration = null;
        let check = await this.client.models.penalties.findOne({ userId: targetId, typeOf: "JAIL" });
        if (!check) check = await this.client.models.penalties.create({
            userId: targetId,
            executor: executorId,
            reason: reason,
            extras: [],
            typeOf: "JAIL",
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
        await memberRoles.forEach(async (roleId) => {
            await this.client.models.penalties.updateOne({ _id: docum._id }, {
                $push: {
                    extras: [
                        {
                            subject: "roles",
                            data: roleId
                        }
                    ]
                }
            });
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

module.exports = EmitRunJail;
