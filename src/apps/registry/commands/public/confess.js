import { UserContextMenuCommandInteraction, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import Responder from '@/classes/Responder';
import Bot from '@/classes/Bot';
import { stripIndent } from 'common-tags';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default class ClickDel extends Responder {
    /**
     * @param {Bot} client
     */
    constructor(client) {
        super(client, {
            name: "itiraf",
            description: "bir itiraf gönder",
            customId: "confess",
            type: "slash",
            flag: "slash",
            permissions: [],
            time: 3600000,
            options: [
                {
                    name: "metin",
                    description: "itiraf metni",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        });
    }
    /**
     * @param {Bot} client
     * @param {UserContextMenuCommandInteraction} interaction
     */
    async run(client, interaction, data) {
        const confession_channel = data.channels["confession"];
        if (!confession_channel) return await interaction.reply({
            content: "Bu sunucuda itiraf kanalı ayarlanmamış",
            ephemeral: true
        });
        const text = interaction.options.getString("metin");
        if (!text) return await interaction.reply({
            content: "Lütfen bir metin girin",
            ephemeral: true
        });
        if (!GEMINI_API_KEY) {
            return await interaction.reply({
                content: "AI analiz için API anahtarı eksik",
                ephemeral: true
            });
        }

        let status = "pending";
        try {
            const analysisResult = await analyze(text);
            if (analysisResult === "reddedildi") {
                status = "rejected";
                await interaction.reply({
                    content: "İtirafınız reddedildi. Lütfen kışkırtıcı ifadeler veya anlamsız metinler kullanmayın.",
                    ephemeral: true
                });
            }
            if (analysisResult !== "onaylandı") {
                status = "error";
                await interaction.reply({
                    content: "İtirafınız analiz edilemedi. Lütfen daha sonra tekrar deneyin.",
                    ephemeral: true
                });
            }
            if (analysisResult === "onaylandı") {
                status = "approved";
                const embed = new EmbedBuilder()
                    .setTitle("Yeni bir itiraf geldi")
                    .setDescription(stripIndent`
                    \`\`\`
                    ${text}
                    \`\`\`
                    `)
                    .setColor("Random");
                await client.channels.cache.get(confession_channel).send({
                    embeds: [embed]
                });
                await interaction.reply({
                    content: "İtirafınız başarıyla gönderildi.",
                    ephemeral: true
                });
            }
            await this.client.models.confession.create({
                userId: interaction.user.id,
                content: text,
                status: status
            });
        } catch (err) {
            console.error("AI analiz hatası:", err);
            return await interaction.reply({
                content: "İtirafınız analiz edilemedi. Lütfen daha sonra tekrar deneyin.",
                ephemeral: true
            });
        }
    }
}



async function analyze(content) {
    const prompt = `Metni analiz et. Metinde kışkırtıcı ifade varsa (toxic discord arkadaş ortamına göre yani küfür falan olabilir sınırı aşmadığı sürece) veya kısa/anlamsız bir itiraf ise sadece "reddedildi" olarak yanıt ver. Yoksa yalnızca "onaylandı" yaz, fazladan açıklama ekleme: \n${content}`;

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP status ${response.status}`;
        throw new Error(`Gemini API error: ${errorMsg}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("No candidates returned from Gemini");
    }

    return text.trim();
}

export const handler = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Invalid or empty request body" }),
        };
    }

    let payload;
    try {
        payload = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (err) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Malformed JSON payload" }),
        };
    }

    const uniInput = payload?.uni_name?.trim();
    if (!uniInput) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Invalid input, 'uni_name' is required" }),
        };
    }

    try {
        const uniName = await analyze(uniInput);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uni_name: uniName }),
        };
    } catch (err) {
        console.error("AI analiz hatası:", err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: `AI analysis error: ${err.message}` }),
        };
    }
};