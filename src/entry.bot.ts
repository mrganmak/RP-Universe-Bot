import { importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { CommandsIniter, MongoBase } from "./index.js";

export class Bot {
	private static _client = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.GuildMessageReactions,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.MessageContent,
		]
	});

	public static async start() {
		CommandsIniter.changeClient(this._client);

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);
	
		await MongoBase.initBase();
		await importx(`${__dirname}/{events,commands}/**/**.js`);
		await this._client.login(process.env.TOKEN);
	}
}

Bot.start();
