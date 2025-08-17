import "reflect-metadata";
import { importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { DIService, tsyringeDependencyRegistryEngine } from "@discordx/di";
import { container } from "tsyringe";
import { ModuleCommandsBus, GuildPolicy, registerAllHandlers, TOKENS } from "@src/index.js";

async function int() {
	DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

	const client = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.GuildMessageReactions,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.MessageContent,
		]
	});
	container.registerInstance(TOKENS.Client, client);
	
	const bus = new ModuleCommandsBus();
	container.registerInstance(TOKENS.Bus, bus);

	const policies = new GuildPolicy(client);
	container.registerInstance(TOKENS.GuildPolicy, policies);

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	//await importx(`${__dirname}/{events,commands}/**/**.js`);
	//await client.login(process.env.TOKEN);

	registerAllHandlers();

	console.log(await bus.execute('Ticket.Open', {'guildId': '4', 'userId': '4'}))
}

int();
