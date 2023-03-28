import { Events } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";

@Discord()
class onInteractionCreate {
	@On({ event: Events.InteractionCreate })
	onInteractionCreate(
		[interaction]: ArgsOf<Events.InteractionCreate>,
		client: Client
	) {
		client.executeInteraction(interaction);
	}
}
