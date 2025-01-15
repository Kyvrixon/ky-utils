import {
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	Client,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	MentionableSelectMenuInteraction,
	MessageComponentInteraction,
	MessageFlags,
	ModalSubmitInteraction,
	PermissionFlagsBits,
	RoleSelectMenuInteraction,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
	Message,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder
} from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "node:fs";
import { errEmbed } from "./embeds.js";
import Logger from "./logger.js";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")
);

export const handleCmd = async (
	client: Client | null,
	interaction: ChatInputCommandInteraction | null,
	...extras: any[]
) => {
	const x = interaction?.commandName;
	let z = null,
		y = null;
	try {
		z = interaction?.options.getSubcommandGroup();
	} catch {
		z = null;
	}
	try {
		y = interaction?.options.getSubcommand();
	} catch {
		y = null;
	}
	let filePath = path.join(__dirname, "..", "commands", "src");
	if (x) {
		filePath = path.join(filePath, x);
	}
	if (z) {
		filePath = path.join(filePath, z);
	}
	if (y) {
		filePath = path.join(filePath, y + ".js");
	} else {
		filePath = path.join(filePath, ".js");
	}

	if (fs.existsSync(filePath)) {
		const cmd = await import("file://" + filePath);
		await cmd.default(client, interaction, ...extras);
		return true;
	} else {
		return false;
	}
};

export const createLeaderboard = async (
	title: string,
	txt: Array<string>,
	interaction: 
		| ChatInputCommandInteraction
		| ButtonInteraction,
	pageCount = 10,
	extra_components = null,
	footerText: string | null
) => {
	let lb: Array<string>;
	let failed: boolean = false;
	let single: boolean = false;
	if (pageCount === 1) {
		single = true;
	}
	if (txt?.length === 0 || !txt) {
		lb = ["Invalid data was provided"];
		failed = true;
	} else {
		lb = txt;
	}
	if (!lb) {
		lb = ["Invalid data was provided"];
		failed = true;
	}

	// safeguard
	if (failed) {
		return;
	}

	const generateEmbed = async (start: number, lb: Array<string>, title: string) => {
		const itemsPerPage = single ? 1 : pageCount;
		const current = lb.slice(start, start + itemsPerPage).join("\n");
		return new EmbedBuilder()
			.setAuthor({ name: title })
			.setDescription(current)
			.setColor("DarkButNotBlack")
			.setFooter(footer(footerText, null));
	};

	const isMessage = interaction instanceof Message;
	const replyOptions = {
		embeds: [await generateEmbed(0, lb, title)],
		withResponse: true,
	};

	const createButton = (id: string, label: string, disabled = false) =>
		new ButtonBuilder()
			.setCustomId(id)
			.setLabel(label)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled);

	const totalPages = Math.ceil(single ? lb.length : lb.length / pageCount);
	const row = new ActionRowBuilder()
		.addComponents(createButton("back_button", "prev", true))
		.addComponents(
			createButton("page_info", `1/${totalPages}`, totalPages === 1)
		)
		.addComponents(
			createButton("forward_button", "next", lb.length <= pageCount)
		);

	const replyMethod =
		interaction.deferred || interaction.replied ? "editReply" : "reply";
	let msg;
	try {
		// @ts-ignore
		msg = await interaction[replyMethod]({
			...replyOptions,
			components: extra_components ? [row, extra_components] : [row],
		});
	} catch (e) {
		return await interaction?.channel?.send({
			embeds: [
				errEmbed(
					"Something went wrong while trying to initialise a module",
					e,
					interaction
				),
			],
		});
	}

	let currentIndex = 0;
	const collector = msg.createMessageComponentCollector({
		componentType: Discord.ComponentType.Button,
		time: 60000,
	});

	collector.on("collect", async (btn) => {
		// --------------------------------------------------------------------------------------------
		//                               safeguard from extra components
		// --------------------------------------------------------------------------------------------
		if (
			btn.customId !== "back_button" &&
			btn.customId !== "page_info" &&
			btn.customId !== "forward_button"
		) {
			return;
		}
		// --------------------------------------------------------------------------------------------

		if (
			btn.user.id ===
			(isMessage ? interaction.author.id : interaction.user.id)
		) {
			if (btn.customId === "page_info") {
				const modal = new Discord.ModalBuilder()
					.setCustomId("page_modal")
					.setTitle("Page Indexer")
					.addComponents(
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setCustomId("page_number")
								.setLabel(
									"Please provide the page number you wish to visit"
								)
								.setStyle(Discord.TextInputStyle.Short)
								.setRequired(true)
						)
					);

				await btn.showModal(modal);
				const modalSubmit = await btn
					.awaitModalSubmit({ time: 15000 })
					.catch(() => null);

				if (modalSubmit) {
					const pageNumber = parseInt(
						modalSubmit.fields.getTextInputValue("page_number"),
						10
					);
					if (
						isNaN(pageNumber) ||
						pageNumber < 1 ||
						pageNumber > totalPages
					) {
						await modalSubmit.reply({
							content: "Invalid page number.",
							flags: MessageFlags.Ephemeral,
						});
					} else {
						currentIndex = (pageNumber - 1) * pageCount;
						const row2 =
							new Discord.ActionRowBuilder().addComponents(
								createButton(
									"back_button",
									"prev",
									currentIndex === 0
								),
								createButton(
									"page_info",
									`${pageNumber}/${totalPages}`,
									totalPages === 1
								),
								createButton(
									"forward_button",
									"next",
									currentIndex + (single ? 1 : pageCount) >=
										lb.length
								)
							);

						await Promise.all([
							msg.edit({
								embeds: [
									await generateEmbed(
										currentIndex,
										lb,
										title
									),
								],
								components: extra_components
									? [row2, extra_components]
									: [row2],
							}),
							modalSubmit.deferUpdate(),
						]);
						collector.resetTimer();
					}
				}
			} else {
				currentIndex +=
					btn.customId === "back_button" ? -pageCount : pageCount;

				const row2 = new Discord.ActionRowBuilder().addComponents(
					createButton("back_button", "prev", currentIndex === 0),
					createButton(
						"page_info",
						`${Math.floor(currentIndex / (single ? 1 : pageCount)) + 1}/${totalPages}`,
						totalPages === 1
					),
					createButton(
						"forward_button",
						"next",
						currentIndex + (single ? 1 : pageCount) >= lb.length
					)
				);

				await Promise.all([
					msg.edit({
						embeds: [await generateEmbed(currentIndex, lb, title)],
						components: extra_components
							? [row2, extra_components]
							: [row2],
					}),
					btn.deferUpdate(),
				]);
				collector.resetTimer();
			}
		} else {
			await btn.reply({
				content: "This isn't for you",
				flags: MessageFlags.Ephemeral,
			});
			collector.resetTimer();
		}
	});

	collector.on("end", async () => {
		const rowDisable = new Discord.ActionRowBuilder().addComponents(
			createButton("expired_button", "This component has expired!", true)
		);
		try {
			await msg.edit({
				components: extra_components
					? [rowDisable, extra_components]
					: [rowDisable],
			});
		} catch {}
	});
};

export const footer = (text: string | null | undefined, pic: string | null | undefined): { text: string; iconURL?: string } => {
    return {
        text: `${text || ""}\n© Kyvrixon™ 2025 | v${packageJson.version}`,
        iconURL: pic || undefined,
    };
};

/**
 * Get an invite for the provided guild
 *
 * @param {Discord.Guild} guild - Guild object
 * @param {Discord.Channel} channel - Channel object
 */
export const getInvite = async (guild, channel) => {
	try {
		let invite = null;
		let invites = [];

		try {
			invites = await guild.invites.fetch();
		} catch (fetchError) {
			Logger.error(
				"function getInvite",
				`Error fetching invites for server: ${guild.name} | ${guild.id}`,
				fetchError
			);
		}

		if (invites.size > 0) {
			invite =
				invites.find(
					(invite) =>
						invite.inviter?.id === client.user.id &&
						!invite.expiresAt
				) || invites.find((invite) => !invite.expiresAt);
		}

		if (!invite && channel) {
			try {
				invite = await guild.invites.create(channel.id, { maxAge: 0 });
			} catch (createError) {
				Logger.error(
					"function getInvite",
					`Error creating invite for channel: ${channel.id} in guild: ${guild.name} | ${guild.id}`,
					createError
				);
			}
		}

		if (!invite && !channel) {
			const targetChannel =
				guild.systemChannel ||
				guild.channels.cache.find(
					(ch) =>
						ch.isTextBased() &&
						ch
							.permissionsFor(client.user.id)
							.has(PermissionFlagsBits.CreateInstantInvite)
				);

			if (targetChannel) {
				try {
					invite = await targetChannel.createInvite({ maxAge: 0 });
				} catch (createError) {
					Logger.error(
						"function getInvite",
						`Error creating invite for channel: ${targetChannel.id} in guild: ${guild.name} | ${guild.id}`,
						createError
					);
				}
			} else {
				Logger.error(
					"function getInvite",
					`No suitable channel found for creating invite in guild: ${guild.name} | ${guild.id}`
				);
			}
		}

		return invite ? invite.url : null;
	} catch (error) {
		Logger.error(
			"function getInvite",
			`Unexpected error while processing invites for server: ${guild.name} | ${guild.id}`,
			error
		);
		return null;
	}
};

/**
 * Makeshift delay system
 *
 * @param {Number} time
 * @returns {Promise<void>} Promise
 */
export const delay = async (time) => {
	const t = time * 1000;
	return new Promise((resolve) => setTimeout(resolve, t));
};

/**
 * Complex permission checker
 *
 * @param {Array} botPermissions Array of permissions e.g. ["ManageMessages"]
 * @param {Array} userPermissions Array of permissions e.g. ["ManageMessages"]
 * @param {any} source Message or Interaction
 * @param {String} type "both", "user" or "bot"
 * @param {String} target "self" or "channel"
 * @param {String} [channelId] Optional channel ID to check permissions in
 * @returns {Promise<Boolean>} Boolean promise
 */
export const checkPermissions = async (
	botPermissions,
	userPermissions,
	source,
	type = "both",
	target = "channel",
	channelId
) => {
	const guild = source.guild;
	const channel = channelId
		? guild.channels.cache.get(channelId) ||
			(await guild.channels.fetch(channelId))
		: source.channel;

	if (!channel) {
		throw new Error("Channel not found");
	}

	const checkPermissionFor = (permission, memberId, isSelf) => {
		const member = isSelf
			? guild.members.cache.get(memberId)
			: channel.guild.members.cache.get(memberId);
		return member?.permissionsIn(channel).has(permission);
	};

	const checkAllPermissions = (permissionsArray, memberId, isSelf) => {
		return permissionsArray.every((permission) =>
			checkPermissionFor(permission, memberId, isSelf)
		);
	};

	if (type === "both") {
		const botHasPermissions = await checkAllPermissions(
			botPermissions,
			guild.members.me.id,
			target === "self"
		);
		const userHasPermissions = await checkAllPermissions(
			userPermissions,
			source.user.id,
			target === "self"
		);
		return botHasPermissions && userHasPermissions;
	} else if (type === "user") {
		return await checkAllPermissions(
			userPermissions,
			source.user.id,
			target === "self"
		);
	} else if (type === "bot") {
		return await checkAllPermissions(
			botPermissions,
			guild.members.me.id,
			target === "self"
		);
	}

	return false;
};

/**
 * Checks if a colour is valid to use in embeds.
 *
 * @param {string} input
 * @returns {boolean}
 */
export const isValidColour = (input) => {
	if (typeof input === "string") {
		if (Discord.Colors[input]) {
			return true;
		}
		if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
			return true;
		}
		if (/^0x[0-9A-Fa-f]{6}$/.test(input)) {
			return true;
		}
	}

	if (typeof input === "number") {
		return input >= 0 && input <= 0xffffff;
	}

	return false;
};

/**
 * Convert a new Date() to discord timestamp format.
 *
 * @param {Number} date
 * @returns {String} your unix timestamp
 */
export const convertToUnix = (date) => {
	return Math.floor(date / 1000);
};

/**
 * Generate a random generated ID.
 *
 * @param {number} length
 * @returns {string}
 */
export const generateId = (length) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
};

export const getCmdPath = (source: ChatInputCommandInteraction | any): string => {
	if (!source || !source.commandName) {
		return "";
	}

	let cmdValueString = "";

	if (source instanceof ChatInputCommandInteraction) {
		const group = source.options.getSubcommandGroup(false);
		const sub = source.options.getSubcommand(false);
		const commandInfo = {
			subcommandGroup: group,
			subcommand: sub,
		};
		cmdValueString = `> \`/${source.commandName} ${commandInfo.subcommandGroup ? `${commandInfo.subcommandGroup} ` : ""}${commandInfo.subcommand || ""}\``;
	} else if (source instanceof ContextMenuCommandInteraction) {
		cmdValueString = `> \`/${source.commandName}\``;
	} else if (source instanceof ModalSubmitInteraction) {
		cmdValueString = `> \`Modal: ${source.customId}\``;
	} else if (
		source instanceof StringSelectMenuInteraction ||
		source instanceof UserSelectMenuInteraction ||
		source instanceof RoleSelectMenuInteraction ||
		source instanceof MentionableSelectMenuInteraction ||
		source instanceof ChannelSelectMenuInteraction
	) {
		cmdValueString = `> \`Select Menu: ${source.customId}\``;
	} else if (source instanceof ButtonInteraction) {
		cmdValueString = `> \`Button: ${source.customId}\``;
	} else {
		cmdValueString = "> `Unknown Interaction Type`";
	}

	return cmdValueString;
};

export const genColour = () => {
	const hexChars = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += hexChars[Math.floor(Math.random() * 16)];
	}

	return color;
};

//===================
export default {
	handleCmd,
	createLeaderboard,
	footer,
	getInvite,
	delay,
	checkPermissions,
	isValidColour,
	convertToUnix,
	generateId,
	genColour,
};
