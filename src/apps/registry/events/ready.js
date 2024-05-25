const { ClientEvent, Bot } = require("../../../base/classes");

class Ready extends ClientEvent {

	/**
	 * @param {Bot} client
	 */
	constructor(client) {
		super(client, {
			name: "_ready"
		});
		this.client = client;
	}

	/**
	 * @param {Bot} client
	 */
	async run(client) {
		await client.guild.invites.fetch({ cache: false }).then(async (invites) => {
			this.client.invites = invites;
			await this.client.redis.set(`inv_guild:${client.config.guildId}`, JSON.stringify(invites));
		}).catch(console.error);
		if (this.client.guild.vanityURLCode) await client.guild.fetchVanityData().then(async (res) => {
			await this.client.redis.set(`inv_guild:${client.config.guildId}:url`, JSON.stringify(res.uses));
		}).catch(console.error);

		const guildMembers = client.guild.members.cache.map((member) => {
			return {
				_id: member.user.id,
				roles: member.roles.cache.map((r) => r.id)
			}
		});
		const dataMembers = await this.client.models.member.find();
		//dbde kayıtlı ama sunucudan çıkmış üyelerin verisini sil
		const quitters = dataMembers.filter(({ _id: docId }) => !guildMembers.map(({ _id: memberId }) => memberId).includes(docId));
		await quitters.forEach(async ({ _id }) => {
			await this.client.models.member.updateOne({ _id }, { $set: { roles: [] } });
		})
		//sunucuda olan üyeler dbde ise her birini yenile
		const updateds = guildMembers.filter(({ _id: memberId }) => dataMembers.map(({ _id: docId }) => docId).includes(memberId))
		await updateds.forEach((async ({ _id, roles }) => {
			await this.client.models.member.updateOne({ _id }, {
				$set: roles
			});
		}))
		//sunucuda olan ama verisi olmayanı oluştur
		const plebs = guildMembers.filter(({ _id: memberId }) => !dataMembers.map(({ _id: docId }) => docId).includes(memberId));
		await this.client.models.member.insertMany(plebs);

		console.log(`[KAYITLAR TAMAMLANDI] ${quitters.length} quited | ${updateds.length} updated |${plebs.length} pleb`);

		// rol verilerinin işlenmesi
		const roles = client.guild.roles.cache.map(r => r);
		for (let index = 0; index < roles.length; index++) {
			const role = roles[index];
			const roleData = await client.models.roles.findOne({ meta: { $elemMatch: { _id: role.id } } });
			if (!roleData) await client.models.roles.create({
				keyConf: null,
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
						emoji: role.unicodeEmoji
					}
				]
			});
		}

		const channels = client.guild.channels.cache.map((c) => c.id);
		for (let index = 0; index < channels.length; index++) {
			const channel = client.guild.channels.cache.get(channels[index]);
			const exclude = ["messages", "permissionOverwrites", "threads", "lastMessageId", "createdTimestamp", "guild", "guildId", "parentId"]
			const json = {}
			Object.keys(channel.toJSON()).filter(k => !exclude.includes(k)).forEach((k) => json[k] = channel.toJSON()[k]);
			const olddata = await client.models.channels.findOne({ meta: { $elemMatch: { id: channel.id } } });
			if (!olddata) {
				await client.models.channels.create({
					kindOf: channel.type.toString(),
					parent: channel.parentId,
					keyConf: null,
					points: 0,
					meta: [json],
					overwrites: channel.permissionOverwrites.cache.map((o) => {
						return {
							_id: o.id,
							typeOf: o.type.toString(),
							allow: o.allow.toArray(),
							deny: o.deny.toArray()
						}
					})
				});

			} else {
				await client.models.channels.updateOne({
					$set: {
						kindOf: channel.type.toString(),
						parent: channel.parentId,
						meta: [json],
						overwrites: channel.permissionOverwrites.cache.map((o) => {
							return {
								_id: o.id,
								typeOf: o.type.toString(),
								allow: o.allow.toArray(),
								deny: o.deny.toArray()
							}
						})
					}
				});

			}
		}

	}
}

module.exports = Ready;
