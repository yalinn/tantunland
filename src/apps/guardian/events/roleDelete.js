import { Role } from 'discord.js';
import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';
import { stripIndents } from 'common-tags';

export default class RoleDelete extends BotEvent {

    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "roleDelete",
            action: "RoleDelete",
            punish: "timeout",
            closePerms: ["ManageRoles", "Administrator"],
            sequence: false
        })
        this.client = client;
    }

    /**
     * @param {Role} role
     */
    async run(role) {
        let doc_id;
        let roleData = await this.client.models.roles.findOne({ meta: { $elemMatch: { _id: role.id } } });
        if (!roleData) {
            let document = await this.client.models.roles.create({
                meta: [
                    {
                        _id: role.id,
                        name: role.name,
                        icon: role.icon,
                        color: role.hexColor,
                        hoist: role.hoist,
                        mentionable: role.mentionable,
                        position: role.rawPosition,
                        bitfield: role.permissions.bitfield.toString(),
                        created: role.createdAt,
                        emoji: role.unicodeEmoji,
                        timestamp: new Date()
                    }
                ]
            });
            doc_id = document._id;
        } else {
            doc_id = roleData._id;
        }
        await this.client.models.roles.updateOne({ _id: doc_id }, {
            $set: {
                deleted: true
            }
        });
    }

    /**
     * @param {Role} role
     */
    async fix(role) {
        let roleData = await this.client.models.roles.findOne({ meta: { $elemMatch: { _id: role.id } } });
        if (!roleData) {
            await this.client.models.roles.create({
                meta: [
                    {
                        _id: role.id,
                        name: role.name,
                        icon: role.icon,
                        color: role.hexColor,
                        hoist: role.hoist,
                        mentionable: role.mentionable,
                        position: role.rawPosition,
                        bitfield: role.permissions.bitfield.toString(),
                        created: role.createdAt,
                        emoji: role.unicodeEmoji,
                        timestamp: new Date()
                    }
                ]
            });
            roleData = await this.client.models.roles.findOne({ meta: { $elemMatch: { _id: role.id } } });
        }
        const newRole = await role.guild.roles.create(role.toJSON(), `Guardian Role Delete Fix for role ID: ${role.id}`);
        await this.client.models.member.updateMany({ roles: role.id }, {
            $pull: {
                roles: role.id
            },
            $push: {
                roles: newRole.id
            }
        });
        await this.client.models.roles.updateMany({ givers: role.id }, {
            $pull: {
                givers: role.id
            },
            $push: {
                givers: newRole.id
            }
        });
    }
}