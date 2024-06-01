const { InteractionType, PermissionsBitField, Interaction, CommandInteraction } = require('discord.js');
const { Bot, ClientEvent } = require('../base/classes');
class IntCreateEvent extends ClientEvent {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "interactionCreate",
            action: null
        });
        this.name = "interactionCreate";
        this.client = client;
    }

    /**
     * @param {Interaction} interaction 
     */
    async run(interaction) {
        if (interaction.guild && (interaction.guildId !== this.client.config.guildId)) return;
        let cmd;
        if (interaction.type === InteractionType.ApplicationCommand) {
            cmd = this.client.responders.get(interaction.commandId);
        } else {
            cmd = this.client.responders.get(interaction.customId);
        }
        if (!cmd) return;
        if (cmd.props.permissions.length > 0 && !cmd.props.permissions.some(p => interaction.member.roles.cache.has(this.data.roles[p])) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({
                content: "Bunu yapmaya yetkin yok!",
                ephemeral: true
            });
        }
        //burası önemli (ownerOnly açma) babanın amını yalarım
        if (!cmd.props.enabled && interaction.user.id !== this.client.owner.id) {
            return await interaction.reply({
                content: `Bu komut şuan için **devredışı**`,
                ephemeral: true
            });
        }
        if (cmd.props.devOnly && this.client.config.developers.includes(interaction.user.id)) {
            return await interaction.reply({
                content: `Bu komutu sadece **Geliştiriciler** kullanabilir`,
                ephemeral: true
            });
        }
        if (cmd.props.rootOnly && !this.client.config.developers.concat(this.client.config.roots).includes(interaction.user.id)) {
            return await interaction.reply({
                content: `Bu komutu sadece **Kurucular** kullanabilir`,
                ephemeral: true
            });
        }
        if (cmd.props.adminOnly && !interaction.member.permissions.toArray().includes("Administrator")) {
            return await interaction.reply({
                content: `Bu komutu sadece **Yöneticiler** kullanabilir`,
                ephemeral: true
            });
        }
        if (cmd.props.channels.length > 0 && !cmd.channels.map((k) => this.data.channels[k]).includes(interaction.channelId)) {
            return await interaction.reply({
                content: `Bu komutu bu kanalda kullanamazsın.`,
                ephemeral: true
            });
        }
        if (cmd.props.permissions.length > 0 && !cmd.props.permissions.map((k) => this.data.roles[k]).some(roleId => interaction.member.roles.cache.has(roleId))) {
            return await interaction.reply({
                content: `Bu komutu kullanacak yetkiye sahip değilsin.`,
                ephemeral: true
            });
        }
        let cooldown = cmd.cooldown.get(interaction.user.id);
        if (cooldown && (cooldown > Date.now())) return await interaction.reply({
            content: `Komutu tekrar kullanabilmek için lütfen **<t:${Math.round(cooldown / 1000)}:R>** tekrar kullanabileceksin!`,
            ephemeral: true
        });
        try {
            await cmd.run(this.client, interaction, this.data);
            console.log(`[(${interaction.user.id})] ${interaction.user.username} ran command [${cmd.conf.name}]`, "cmd");
            cmd.cooldown.set(interaction.user.id, Date.now());
        } catch (e) {
            console.log(e, "error");
        }
    }
}

module.exports = IntCreateEvent;
