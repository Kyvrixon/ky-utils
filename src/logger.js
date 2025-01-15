/* eslint-disable no-console */
import chalk from "chalk";
import { errEmbed } from "./embeds.js";

const Logger = {
	/**
	 * Log a success message.
	 *
	 * @param {string} title - Title of the log
	 * @param {string} message - Message to log
	 */
	success: (title, message) => {
		console.log(
			chalk.bold.cyan(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.green(message)
		);
		return;
	},

	/**
	 * Log a warning message.
	 *
	 * @param {string} title - Title of the log
	 * @param {string} message - Message to log
	 */
	warn: (title, message) => {
		console.warn(
			chalk.bold.yellow(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.yellow(message)
		);
		return;
	},

	/**
	 * Log an info message.
	 *
	 * @param {string} title - Title of the log
	 * @param {string} message - Message to log
	 */
	info: (title, message) => {
		console.log(
			chalk.bold.blue(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.white(message)
		);
		return;
	},

	/**
	 * Log a debug message if debug is enabled.
	 *
	 * @param {string} title - Title of the log
	 * @param {string} message - Message to log
	 */
	debug: (title, message) => {
		if (!process.env.debugFlag || process.env.debugFlag !== "yes") {
			return;
		}
		console.log(
			chalk.bold.magenta(`[Debug - ${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.white(message)
		);
		return;
	},

	/**
	 * Log an error message.
	 *
	 * @param {string} title - Title of the log
	 * @param {string} message - Message to log
	 * @param {Error | null} error - The error object to log
	 * @param {Object} source - (optional) where the error came from
	 */
	error: (title, message, error, source = null) => {
		console.error(
			chalk.bold.red(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.red(message)
		);

		if (error instanceof Error && error.stack) {
			console.log(chalk.grey("[=========BEGIN=========]"));
			console.error(chalk.bold.red(error.stack));
			console.log(chalk.grey("[=========END==========]"));
		}

		if (source) {
			// just fire its error logging logic
			// as im way too lazy to separate it
			errEmbed(message, error, source, title);
		}

		return;
	},
};

export default Logger;
