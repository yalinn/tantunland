const { PermissionFlagsBits } = require("discord.js")

module.exports.permissions = [
    'CreateInstantInvite',
    'Administrator',
    'AddReactions',
    'Stream',
    'ViewChannel',
    'SendMessages',
    'EmbedLinks',
    'AttachFiles',
    'ReadMessageHistory',
    'MentionEveryone',
    'UseExternalEmojis',
    'Connect',
    'Speak',
    'UseVAD',
    'ChangeNickname',
    'UseApplicationCommands',
    'RequestToSpeak',
    'CreatePublicThreads',
    'CreatePrivateThreads',
    'UseExternalStickers',
    'SendMessagesInThreads',
    'UseEmbeddedActivities',
    'UseSoundboard',
    'UseExternalSounds',
    'SendVoiceMessages'
]

module.exports.keyConfs = {
    temel_rol: [
        {
            name: "Kayıtsız",
            value: "kayıtsız"
        },
        {
            name: "Erkek",
            value: "erkek"
        },
        {
            name: "Kadın",
            value: "kadın"
        },
        {
            name: "Şüpheli",
            value: "şüpheli"
        },
        {
            name: "Taglı",
            value: "taglı"
        },
        {
            name: "Vip",
            value: "vip"
        }
    ],
    ceza_rol: [
        {
            name: "Mute rolü",
            value: "susturulmuş"
        },
        {
            name: "Cezalı rolü",
            value: "cezalı"
        },
        {
            name: "Underworld rolü",
            value: "karantina"
        }
    ],
    yetenek_rol: [
        {
            name: "Mute rolü",
            value: "susturulmuş"
        },
        {
            name: "Cezalı rolü",
            value: "cezalı"
        },
        {
            name: "Underworld rolü",
            value: "karantina"
        }

    ],
    ek_rol: [
        {
            name: "Mute rolü",
            value: "susturulmuş"
        },
        {
            name: "Cezalı rolü",
            value: "cezalı"
        },
        {
            name: "Underworld rolü",
            value: "karantina"
        }

    ],
    kanal: [
        {
            name: "genel chat",
            value: "genel_chat"
        },
        {
            name: "karşılama kanalı",
            value: "welcome_chat"
        },
        {
            name: "kayıt kategorisi",
            value: "area_registry"
        },
        {
            name: "public kategorisi",
            value: "area_public"
        },
        {
            name: "stream kategorisi",
            value: "area_stream"
        }
    ],
    izin_rol: [
        {
            name: "Mute rolü",
            value: "susturulmuş"
        },
        {
            name: "Cezalı rolü",
            value: "cezalı"
        },
        {
            name: "Underworld rolü",
            value: "karantina"
        }

    ]

}

module.exports.modPerms = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ChangeNickname,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.ManageGuildExpressions,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageEvents,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ManageNicknames,
    PermissionFlagsBits.ManageThreads,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.DeafenMembers,
    PermissionFlagsBits.MoveMembers,
    PermissionFlagsBits.MentionEveryone,
    PermissionFlagsBits.ViewAuditLog
]