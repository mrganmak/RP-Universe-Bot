import { Client, Discord, Once } from "discordx";
import { CommandsIniter } from "../../index.js";
import { Events } from "discord.js";

@Discord()
class onReady {
	@Once({ event: Events.ClientReady })
	async onReady([], client: Client) {
		await client.guilds.fetch();

		console.log(`Connected as ${client.user?.tag}`);

		CommandsIniter.initCommands();
	}
}
