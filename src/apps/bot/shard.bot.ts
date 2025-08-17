import { ShardingManager } from "discord.js";
import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

export class ShardBot {
	static start(): void {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		const path = `${__dirname}/../../../.env`;
		const dotenvConfigOutput = config({ path });
		if (!dotenvConfigOutput.parsed) throw new Error('Something went wrong while parsing .env');
		console.log(`${(Array.isArray(dotenvConfigOutput.parsed) ? dotenvConfigOutput.parsed.length : Object.values(dotenvConfigOutput.parsed).length)} propertys parsed`);

		const manager = new ShardingManager(`${__dirname}/entry.bot.js`, {
			totalShards: 'auto',
			token: process.env.TOKEN,
			respawn: true
		});

		manager.on('shardCreate', (shard) => {
			console.log(`Launched shard ${shard.id}`);

			shard.on('error', (error) => {
				console.log(error);
			});
		});

		manager.spawn();
	}
}

ShardBot.start();
