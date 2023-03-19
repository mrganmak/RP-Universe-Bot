import { Client, Discord, Once } from "discordx";
import { CommandsIniter } from "../../index.js";

@Discord()
class onReady {
	@Once({ event: 'ready' })
	async onReady([], client: Client) {
		await client.guilds.fetch();

		console.log(`Connected as ${client.user?.tag}`);

		CommandsIniter.initCommands();
	}
}
