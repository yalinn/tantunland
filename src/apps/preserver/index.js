import Bot from '@/classes/Bot';
import { ChannelType, GatewayIntentBits, PermissionFlagsBits, PermissionOverwrites } from 'discord.js';
const client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
    ]
}, __dirname);
process.on("warning", (warn) => { console.log(warn) });
process.on("beforeExit", async () => {
    await client.redis.disconnect();
    console.log('Bitiriliyor...');
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.message.id !== "1267209742732886171") return;
    if (reaction.emoji.identifier === "man_detective") return;
    let member = await reaction.message.guild.members.fetch(user.id);
    if (!member.roles.cache.has("1267178678291271832")) {
        await reaction.message.guild.members.cache.get(user.id).roles.add("1267178678291271832");
    }
    await reaction.users.remove(user);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    const temps = await client.redis.get("temp_channel") || [];
    if (oldState.channel?.members.size === 0) {
        const temp = temps.find(t => t.channelId === oldState.channelId);
        if (temp) {
            const channel = oldState.guild.channels.cache.get(temp.channelId);
            if (channel) await channel.delete({ reason: "Masa boşaldı" });
            await client.models.temp.deleteOne({ channelId: temp.channelId });
        }
    }
    if (newState.channelId === "1267189841758519408") {
        if (temps.map(t => t.userId).includes(newState.member.id)) {
            console.log({ temps, newState: newState.member.id });
            const temp = temps.find(t => t.userId === newState.member.id);
            const channel = newState.guild.channels.cache.get(temp.channelId);
            if (channel) await newState.member.voice.setChannel(channel);
            return;
        }
        const channel = await newState.guild.channels.create({
            type: ChannelType.GuildVoice,
            parent: "1267189777115910157",
            name: newState.member.nickname || newState.member.user.username,
            permissionOverwrites: [
                {
                    id: newState.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.Connect]
                },
                {
                    id: newState.member.id,
                    allow: [
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers,
                        PermissionFlagsBits.ManageRoles
                    ]
                }
            ]
        });
        await client.models.temp.create({
            userId: newState.member.id,
            channelId: channel.id
        });
        await newState.member.voice.setChannel(channel, "Paşama bak bi de taşıtıyor");
    }
});