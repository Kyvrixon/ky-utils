import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelSelectMenuInteraction,
    CommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    MentionableSelectMenuInteraction,
    Message,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    TextChannel,
	ChatInputCommandInteraction,
	MessageInteractionMetadata,
	chatInputApplicationCommandMention
} from "discord.js";
import { footer, getInvite } from "./functions.js";
import Logger from "./logger.js";


/**
 * Creates an error embed message.
 *
 * @param {string} message - The message content of the embed.
 * @param {Error | null} e - The error object. Is allowed to be null.
 * @param {Source | null} s - The source object that triggered for example interaction or message.
 * @param {string} title - The title of the embed.
 * @returns {EmbedBuilder} EmbedBuilder instance.
 */
export const errEmbed = (
    message: string,
    e: Error | null,
    s: 
	| Message
    | MessageInteractionMetadata 
    | ChatInputCommandInteraction
    | CommandInteraction
    | ContextMenuCommandInteraction
    | ModalSubmitInteraction
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | MentionableSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | ButtonInteraction,
    title: string = "Oops.. something went wrong"
): EmbedBuilder => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 10; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const embedReply = new EmbedBuilder()
        .setColor("Red")
        .setTitle(title)
        .setDescription(`> ${message}`)
        .setFooter(footer(null, null));

    if (e && s) {
        embedReply
            .setDescription(`\`\`\`\n${message}\`\`\``)
            .setAuthor({ name: `Error ID: ${code}` })
            .addFields({
                name: "__Error Help__",
                value: "> If the error affects functionality, join our support server, open a ticket, and share the **Error ID**. A dev may join to investigate, please grant necessary permissions they request. Use `/auth-check` to verify their identity first.",
                inline: false,
            })
            .setFooter(footer(null, null));

        // sendLog(e, s);
    }
    return embedReply;

    // async function sendLog(error: Error, source: Message | ChatInputCommandInteraction) {
    //     if (!(source instanceof Message) && !(source instanceof ChatInputCommandInteraction)) {
    //         return Logger.error(
    //             "function errEmbed",
    //             "Source object isn't of BaseInteraction or Message",
    //             error
    //         );
    //     }

    //     let cmdValueString = "";
    //     if (source instanceof CommandInteraction) {
    //         let group = null,
    //             sub = null;
    //         try {
    //             group = source.options.getSubcommandGroup();
    //         } catch {
    //             group = null;
    //         }
    //         try {
    //             sub = source.options.getSubcommand();
    //         } catch {
    //             sub = null;
    //         }

    //         const commandInfo = {
    //             subcommandGroup: group,
    //             subcommand: sub,
    //         };
    //         cmdValueString = `> \`/${source.commandName} ${commandInfo.subcommandGroup ? `${commandInfo.subcommandGroup} ` : ""}${commandInfo.subcommand || ""}\``;
    //     } else if (source instanceof ContextMenuCommandInteraction) {
    //         cmdValueString = `> \`/${source.commandName}\``;
    //     } else if (source instanceof ModalSubmitInteraction) {
    //         cmdValueString = `> \`Modal: ${source.customId}\``;
    //     } else if (
    //         source instanceof StringSelectMenuInteraction ||
    //         source instanceof UserSelectMenuInteraction ||
    //         source instanceof RoleSelectMenuInteraction ||
    //         source instanceof MentionableSelectMenuInteraction ||
    //         source instanceof ChannelSelectMenuInteraction
    //     ) {
    //         cmdValueString = `> \`Select Menu: ${source.customId}\``;
    //     } else if (source instanceof ButtonInteraction) {
    //         cmdValueString = `> \`Button: ${source.customId}\``;
    //     } else {
    //         cmdValueString = "> `Unknown Interaction Type`";
    //     }

    //     const embedLog = new EmbedBuilder()
    //         .setTitle("An error occurred")
    //         .setDescription(
    //             `__**Error Message:**__ \`\`\`\n${error?.message}\`\`\`\n__**Stack Trace:**__ \`\`\`\n${error?.stack}\`\`\``
    //         )
    //         .addFields(
    //             {
    //                 name: "__Error Code__",
    //                 value: `> \`${code}\``,
    //                 inline: true,
    //             },
    //             {
    //                 name: "__Server__",
    //                 value: `> \`${source?.guild?.name}\``,
    //                 inline: true,
    //             },
    //             {
    //                 name: "__User__",
    //                 value: `> \`${source instanceof Message ? source?.author?.username : source?.user?.username}\``,
    //                 inline: true,
    //             },
    //             {
    //                 name: "__Channel__",
    //                 value: `> \`${source?.channel?.name || "Cannot find channel"}\`\n> <#${source?.channel?.id}>`,
    //                 inline: true,
    //             },
    //             {
    //                 name: "__Timestamp__",
    //                 value: `> <t:${Math.floor(new Date().getTime() / 1000)}:f>`,
    //                 inline: true,
    //             },
    //             {
    //                 name: "__Command/Interaction__",
    //                 value: cmdValueString,
    //                 inline: true,
    //             }
    //         );

    //     const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    //         new ButtonBuilder()
    //             .setStyle(ButtonStyle.Link)
    //             .setURL(await getInvite(source.guild, source.channel as TextChannel))
    //             .setLabel("Click to join the server")
    //     );

    //     // Ill need to modify slightly
	// 	//
    //     // const logChannel = client.channels.cache.get("1322722379113300018") as TextChannel ||
    //     //     (await client.channels.fetch("1322722379113300018") as TextChannel);
    //     // try {
    //     //     await logChannel.send({ embeds: [embedLog], components: [row] });
    //     // } catch (err: any) {
    //     //     Logger.error(
    //     //         "function errEmbed",
    //     //         "Failed to log an error: " + err.message,
    //     //         err
    //     //     );
    //     //     return;
    //     // }
    // }
};

/**
 * Creates a basic embed
 *
 * @param {string} [title=null] - title
 * @param {string} [description=" "] - description
 * @param {Array<{name: string, value: string, inline?: boolean}>} [fields=[]] - array of fields
 * @param {string} [colour="DarkButNotBlack"] - colour
 * @param {object} [author=null] - author
 * @param {string|null} [footerText=null] - (optional) footer text
 * @param {boolean|null} [timestamp=null] - timestamp
 * @param {string|null} [thumbnail=null] - thumbnail
 * @param {string|null} [image=null] - image
 * @returns {EmbedBuilder} - embed object
 */
export const basicEmbed = (
    title: string | null,
    description: string = " ",
    fields: Array<{ name: string, value: string, inline?: boolean }> = [],
    colour: string = "DarkButNotBlack",
    author: { name: string, iconURL?: string, url?: string } | null = null,
    footerText: string | null = null,
    timestamp: boolean | null = null,
    thumbnail: string | null = null,
    image: string | null = null
): EmbedBuilder | null => {
    try {
        const embed: any = new EmbedBuilder();

        // Set properties only if they are provided
        const properties: { [key: string]: any } = {
            title,
            description,
            footer: footerText ? footer(footerText, null) : footer(null, null),
            fields: Array.isArray(fields) && fields.length > 0 ? fields : undefined,
            color: colour,
            timestamp: timestamp || undefined,
            thumbnail,
            image,
        };

        // Iterate through properties and set them if they exist
        for (const [key, value] of Object.entries(properties)) {
            if (value) {
                embed[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](value);
            }
        }

        if (author && typeof author === "object") {
            embed.setAuthor(author);
        }

        return embed;
    } catch (e: any) {
        Logger.error(
            "function basicEmbed",
            "Something went wrong: " + e.message,
            e
        );
        return null;
    }
};