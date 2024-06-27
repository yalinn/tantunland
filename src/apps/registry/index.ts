import Bot from '@/base/classes/Bot';
import { GatewayIntentBits } from 'discord.js';
const client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ]
}, __dirname);
process.on("warning", (warn) => { console.log(warn) });
process.on("beforeExit", async () => {
    await client.redis.disconnect();
    console.log('Bitiriliyor...');
});