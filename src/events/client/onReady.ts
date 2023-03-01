import { Client, Discord, Once } from "discordx";

@Discord()
class onReady {
	@Once({ event: 'ready' })
	async onReady([], client: Client) {
		await client.guilds.fetch();

		console.log(`Connected as ${client.user?.tag}`);

		await client.initApplicationCommands();
	}
}
