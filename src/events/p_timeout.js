import { ClientEvent } from "../base/classes"
import Bot from '@/classes/Bot.ts';
export default class PunishTimeout extends ClientEvent {

    /**
     * @param {Bot} client 
     */
    constructor(client) {
        super(client, {
            name: "pTimeout"
        });
        this.client = client;
    }


    /**
     * Executes the timeout punishment event.
     * @param {Object} params - The parameters for the timeout punishment.
     * @param {string} params.targetId - The ID of the user to timeout.
     * @param {string} params.executorId - The ID of the user executing the timeout.
     * @param {string} params.reason - The reason for the timeout.
     * @param {number} params.duration - The duration of the timeout in minutes.
     * @returns {Promise<void>}
     */
    async exec({ targetId, executorId, reason, duration }, ...args) {
        const member = this.client.guild.members.cache.get(targetId);
        const docum = await this.client.models.penalties.create({
            userId: targetId,
            executor: executorId,
            reason: reason,
            extras: [],
            typeOf: "Timeout",
            duration,
            until: duration ? require('moment')(new Date()).add(duration, "minutes").toDate() : null,
            created: new Date()
        });
        let pushes = [];
        if (args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                const extra = args[i];
                if (typeof extra === "object" && extra.subject) {
                    pushes.push(extra);
                }
            }
        }
        if (pushes.length > 0) {
            await this.client.models.penalties.updateOne({ _id: docum._id }, {
                $push: {
                    extras: pushes
                }
            });
        }
    }
}
