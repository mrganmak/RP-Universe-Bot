import { importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { CommandsIniter, Util, MongoBase } from "./index.js";

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.MessageContent,
	]
});

async function run() {
	CommandsIniter.changeClient(client);

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const path = `${__dirname}/../.env`;
	const dotenvConfigOutput = config({ path });
	if (!dotenvConfigOutput.parsed) throw new Error('Something went wrong while parsing .env');
	Util.debug(`${(Array.isArray(dotenvConfigOutput.parsed) ? dotenvConfigOutput.parsed.length : Object.values(dotenvConfigOutput.parsed).length)} propertys parsed`);

	await MongoBase.initBase();
	await importx(`${__dirname}/{events,commands}/**/**.js`);
	await client.login(process.env.TOKEN);
}

run();
