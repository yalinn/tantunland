import Bot from '@/classes/Bot.ts';
import BotEvent from '@/classes/BotEvent.ts';

export default class Ready extends BotEvent {

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
		await client.guild.channels.cache.get("1267209557785186429").messages.fetch();
	}
}
