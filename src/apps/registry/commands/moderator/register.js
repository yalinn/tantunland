const { Message, CommandInteraction, UserContextMenuCommandInteraction, EmbedBuilder } = require('discord.js');
const { Bot, Responder } = require('../../../../base/classes');
const { stripIndent } = require('common-tags');
class ClickDel extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "kaydet",
            description: "",
            customId: "register",
            type: 2,
            flag: "user",
            permissions: [
                "staff"
            ]
        });
    }
    /**
     * @param {Bot} client
     * @param {UserContextMenuCommandInteraction} interaction
     */
    async run(client, interaction, data) {
        if (!data["roles"]["member"].some(r => interaction.guild.roles.cache.has(r))) return interaction.reply({
            content: "Üye rolü bulunamadı",
            ephemeral: true
        });
        const targetUser = interaction.targetUser;
        if (!targetUser) return interaction.reply({
            content: "Kullanıcı bulunamadı",
            ephemeral: true
        });
        const member = interaction.guild.members.cache.get(targetUser.id);
        if (!member) return interaction.reply({
            content: "Kullanıcı artık sunucuda bulunmuyor",
            ephemeral: true
        });
        if (!member.manageable) return interaction.reply({
            content: "Bu kullanıcıya rol verme yetkim yok",
            ephemeral: true
        });
        const stranger_roles = [
            data["roles"]["stranger"],
            data["roles"]["guest"],
            data["roles"]["autorol"]
        ];
        const member_removal = stranger_roles.filter(r => member.roles.cache.has(r));
        if (stranger_roles.some(r => member.roles.cache.has(r))) await member.roles.remove(stranger_roles.filter(r => member.roles.cache.has(r)));
        await member.roles.add(data["roles"]["member"]);
        await client.models.registry.create({
            userId: interaction.targetUser.id,
            staffId: interaction.user.id,
            fromRoleId: member_removal
        });
        interaction.reply({
            content: "Kullanıcıya rol verildi",
            embeds: [
                new EmbedBuilder().setTitle("Rol verme").setDescription(stripIndent`
                    Kullanıcı: ${member}
                    Rol: ${role}
                `)
            ]
        });

    }
}

module.exports = ClickDel;