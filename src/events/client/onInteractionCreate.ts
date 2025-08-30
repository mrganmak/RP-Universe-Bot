import { Events } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";
import { DEFAULT_BOT_PERMISSIONS, GuildsIdentifiersBase, PermissionsChecker, TextsLocalizationsIds, TokenGenerator, getGuildLanguage, getLocalizationForText } from "../../index.js";

@Discord()
class onInteractionCreate {
	@On({ event: Events.InteractionCreate })
	async onInteractionCreate(
		[interaction]: ArgsOf<Events.InteractionCreate>,
		client: Client
	) {
		if (!interaction.guild) return;
		
		const member = await interaction.guild.members.fetch(interaction.client.user.id).catch(console.error);
		if (!member) return;

		const isClientHasMissingPermissions = PermissionsChecker.isMemberHasMissingPermissions(
			DEFAULT_BOT_PERMISSIONS,
			member
		);
		if (isClientHasMissingPermissions) {
			const guildLanguage = await getGuildLanguage(interaction.guild.id);

			if (interaction.isRepliable()) {
				return await interaction.reply({
					content: (
						getLocalizationForText(
							TextsLocalizationsIds.BOT_MISSING_DEFAULT_PERMISSIONS_ERROR,
							guildLanguage
						)
						+ PermissionsChecker.getMemberMissingPermissions(
							DEFAULT_BOT_PERMISSIONS,
							member
						).join(', ')
					),
					ephemeral: true
				});
			} else {
				return;
			}
		}

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
