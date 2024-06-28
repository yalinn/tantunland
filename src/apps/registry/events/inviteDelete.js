import { Invite } from 'discord.js';
import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';
export default class InviteDelete extends BotEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "inviteDelete"
        })
        this.client = client;
    };

    /**
     * @param {Invite} invite
     */
    async run(invite) {
        if (invite.guild.id !== this.client.config.guildId) return;
        await this.client.guild.invites.fetch().then(async (invites) => {
            this.client.invites = invites;
            await this.client.redis.set(`inv_guild:${invite.guild.id}`, JSON.stringify(invites));
        });
        /* const entry = await invite.guild.fetchAuditLogs({ type: "INVITE_DELETE" }).then(logs => logs.entries.first());
        if (entry.createdTimestamp <= Date.now() - 1000) return; */
        //invite.guild.channels.cache.get(data.channels["guard"]).send(`${data.emojis["davet"]} ${exeMember} bir daveti sildi!`);


        /*   await this.client.guild.invites.fetch().then(async (invites) => {
               await this.client.redis.set(`atl_inv_guild:${invite.guild.id}`, JSON.stringify(invites));
           });*/
    }
}