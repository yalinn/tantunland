const { Bot, ClientEvent, Responder } = require('../base/classes');
const { EmbedBuilder, PermissionFlagsBits, Message } = require('discord.js');

class PrefixCommandCreate extends ClientEvent {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "messageCreate",
            action: null
        });
        this.name = "messageCreate";
        this.client = client;
    }

    /**
     * @param {Message} message
     */
    async run(message) {
        const client = this.client;
        const data = this.data;
        if (!client.config.prefix.some(prefix => message.content.startsWith(prefix)) || message.author.bot) return;
        if (message.guild && message.guild.id !== this.client.config.guildId) return;
        let command = message.content.split(' ')[0].slice(client.config.prefix.find(p => message.content.startsWith(p)).length);
        /**
        * @type {Responder}
        */
        let cmd = client.responders.get(`prefix:${command}`) || client.responders.find(r => r.props.aliases.includes(command)) || null;
        if (!cmd) return;
        let args = message.content.split(' ').slice(1);
        const embed = new EmbedBuilder().setColor('Random');
        /*
        message.options = {};
        cmd.options.forEach((opts) => {

        })
        */
        if (!cmd.props.enabled) return message.channel.send(new EmbedBuilder().setDescription(`${data.emojis["disabledcmd"]} Bu komut şuan için **devredışı**`)
            .setColor('#2f3136'));

        if (cmd.props.devOnly && !client.config.developers.includes(message.author.id)) return; /*message.channel.send({
            embeds: [new EmbedBuilder().setDescription(`Bu komutu sadece ${client.owner} kullanabilir.`)
                .setColor('#2f3136')]
        });*/
        /* if (cmd.props.rootOnly && !data.other["root"].includes(message.author.id) && (message.author.id !== client.config.owner)) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setDescription(`${data.emojis["rootonly"]} Bu komutu sadece **yardımcılar** kullanabilir.`)
                    .setColor('#2f3136')]
            });
        } */
        if (cmd.conf.adminOnly && !message.member.permissions.has(PermissionFlagsBits.Administrator) && (message.author.id !== client.config.owner)) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setDescription(`${data.emojis["modonly"]} Bu komutu sadece **yöneticiler** kullanabilir.`)
                    .setColor('#2f3136')]
            });
        }
        /* if (cmd.props.channels.length > 0 & message.guild.channels.cache.get(channels.get(cmd.info.cmdChannel))) {
            return message.channel.send(new EmbedBuilder().setDescription(`Bu komutu ${message.guild.channels.cache.get(data.channels[cmd.info.cmdChannel])} kanalında kullanmayı dene!`)
                .setColor('#2f3136'));
        } */
        /*if (message.guild && !cmd.props.devOnly && !cmd.conf.dmCmd) {
            const requiredRoles = cmd.info.accaptedPerms || [];
            let allowedRoles = [];
            await requiredRoles.forEach((rolValue) => {
                const role = message.guild.roles.cache.get(data.roles[rolValue]);
                if (role) allowedRoles.push(role.id);
            });
            let deyim = `Bu komutu kullanabilmek için <@&${allowedRoles[0]}> rolüne sahip olmalısın!`;
            if (allowedRoles.length > 1) deyim = `Bu komutu kollanabilmek için aşağıdaki rollerden birisine sahip olmalısın:\n${allowedRoles.map(r => `<@&${r}>`)
                .join(` `)}`;
            if ((allowedRoles.length >= 1) && !allowedRoles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionFlagsBits.Administrator) && (message.author.id !== client.config.owner)) {
                return message.reply({
                    embeds: [embed.setDescription(deyim)
                        .setColor('#2f3136')]
                });
            }
        }*/
        /* let uCooldown = cmd.cooldown[message.author.id];
        if (uCooldown && (uCooldown > Date.now())) return message.channel.send(`Komutu tekrar kullanabilmek için lütfen **${Math.ceil((time - Date.now()) / 1000)}** saniye bekle!`); */
        //client.log(`[(${message.author.id})] ${message.author.username} ran command [${cmd.conf.name}]`, "cmd");
        try {
            cmd.run(client, message, args, this.data, embed);
            /* cmd.cooldown.set(message.author.id, cmd.props.cooldown); */
        } catch (e) {
            console.log(e);
            return message.channel.send(new EmbedBuilder().setDescription(`$Sanırım bir hata oluştu...`)
                .setColor('#2f3136'));
        }
    }
}

module.exports = PrefixCommandCreate;
