import { Events } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";
import { GuildsIdentifiersBase, TokenGenerator } from "../../index.js";

@Discord()
class onInteractionCreate {
	@On({ event: Events.InteractionCreate })
	async onInteractionCreate(
		[interaction]: ArgsOf<Events.InteractionCreate>,
		client: Client
	) {
		if (!interaction.guild) return;

		const database = new GuildsIdentifiersBase();
		const guildIdentifier = await database.getByGuildId(interaction.guild.id);

		if (!guildIdentifier?.token) {
			const token = await TokenGenerator.createTokenForGuild();
			const guildId = interaction.guild.id;
	
			await database.addIdentifier({ token, guildId });
		}	

		client.executeInteraction(interaction);
	}
}
