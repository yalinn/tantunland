<<<<<<< Updated upstream
const { Bot } = require('../../base/classes');
const { GatewayIntentBits } = require('discord.js');
=======
import Bot from '@/classes/Bot';
import { GatewayIntentBits } from 'discord.js';
>>>>>>> Stashed changes
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