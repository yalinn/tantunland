const Discord = require('discord.js');
const { stripIndents } = require("common-tags");
const chp = require("child_process");
const { Responder, Bot } = require("../../../../base/classes");
class Eval extends Responder {

    constructor(client) {
        super(client, {
            name: "eval",
            description: "eval exec",
            customId: "eval",
            type: 1,
            flag: "slash",
            rootOnly: true,
            options: [
                {
                    name: "code",
                    description: "Code to evaluate",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        });
    }

    /**
     * @param {Bot} client
     * @param {Discord.CommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const code = interaction.options.getString("code");
        function clean(text) {
            if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text;
        }
        try {
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
            interaction.reply({
                content: clean(evaled),
                ephemeral: true,
                code: "xl"
            });
        } catch (err) {
            interaction.reply({
                content: `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``,
                ephemeral: true
            });
        }


    }

}

module.exports = Eval;