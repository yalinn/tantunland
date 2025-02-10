import { ApplicationCommandOptionType } from 'discord.js';
import { stripIndents } from "common-tags";
import chp from "child_process";
import Responder from '@/classes/Responder';
import Bot from '@/classes/Bot';
import RoleMenu from '@/models/rolemenu';

export default class Eval extends Responder {

    constructor(client) {
        super(client, {
            name: "rolemenu",
            description: "",
            customId: "rolemenu",
            type: "menu",
            flag: "menu",
        });
    }

    /**
     * @param {Bot} client
     * @param {Discord.CommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const mentioned = client.guild.members.cache.get(interaction.user.id);
        if (interaction.values.includes("clear") && interaction.values.length === 1) {
            return await mentioned.roles.remove(Object.keys(data.roles).filter(key => key.startsWith("hunt_")).map(key => data.roles[key]));
        } else if (interaction.values.includes("hunt_clear")) {
            return await interaction.reply({
                content: "Sadece temizle seçeneğini kullan ya da hiç kullanma.",
                ephemeral: true
            });
        }
        const roleIDs = interaction.values.map(v => data.roles[v]);
        const rolArray = roleIDs.map(rID => client.guild.roles.cache.get(rID));
        await mentioned.roles.remove(Object.keys(data.roles).filter(key => key.startsWith("hunt_")).map(key => data.roles[key]));
        await mentioned.roles.add(roleIDs);
        const responseEmbed = new Discord.MessageEmbed().setDescription(`Sana;\n ${rolArray.join('\n')}\nrollerini verdim.`);
        return await interaction.reply({
            embeds: [responseEmbed],
            ephemeral: true
        });
    }
}