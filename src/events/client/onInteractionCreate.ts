import { ArgsOf, Client, Discord, On } from "discordx";

@Discord()
class onInteractionCreate {
	@On({ event: 'interactionCreate' })
	onInteractionCreate(
		[interaction]: ArgsOf<'interactionCreate'>,
		client: Client
	) {
		client.executeInteraction(interaction);
	}
}
