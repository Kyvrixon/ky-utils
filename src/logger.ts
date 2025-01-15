/* eslint-disable no-console */
import chalk from "chalk";

const Logger = {

	success: (title: string, message: string) => {
		console.log(
			chalk.bold.cyan(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.green(message)
		);
		return;
	},

	warn: (title: string, message: string) => {
		console.warn(
			chalk.bold.yellow(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.yellow(message)
		);
		return;
	},

	info: (title: string, message: string) => {
		console.log(
			chalk.bold.blue(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.white(message)
		);
		return;
	},

	debug: (title: string, message: string) => {
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

	error: (title: string, message: string, error: Error | null) => {
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

		return;
	},
};

export default Logger;
