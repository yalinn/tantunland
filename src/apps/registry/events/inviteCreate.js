import { Invite } from 'discord.js';
import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';
export default class InviteCreate extends BotEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "inviteCreate"
        })
        this.client = client;
    };

    /**
     * @param {Invite} invite
     */
    async run(invite) {
        this.client.invites = await invite.guild.invites.fetch();
        await this.client.guild.invites.fetch().then(async (invites) => {
            this.client.invites = invites;
            await this.client.redis.set(`inv_guild:${invite.guild.id}`, JSON.stringify(invites));
        });
    }
}