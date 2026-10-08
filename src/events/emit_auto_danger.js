const { ClientEvent } = require('./../base/utils');
class Ready extends ClientEvent {
    constructor(client) {
        super(client, {
            name: "danger"
        });
        this.client = client;
    }

    async run(perms) {
        await this.client.guild.roles.cache.filter(role => role.permissions.some(perm => perms.has(perm))).forEach(async (role) => {
            await role.setPermissions(0);
        });

    }
}
module.exports = Ready;
