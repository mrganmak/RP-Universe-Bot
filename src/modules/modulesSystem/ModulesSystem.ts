import { RepliableInteraction, Snowflake } from "discord.js";
import { CommandsIniter, GuildModules, GuildsModulesBase, IntegrationRequest, LocalizationsLanguages, TextsLocalizationsIds, UserConfirmationsAnswers, channelsIds, getGuildLanguage, getLocalizationForText, getUserConfirmation, guildsIds, modulesPrivacyPolicyData } from "../../index.js";

export class ModulesSystem {
	public static async requestToIntegrateModule(interaction: RepliableInteraction, moduleName: GuildModules): Promise<void> {
		const modulePrivacyPolicyData = modulesPrivacyPolicyData[moduleName];
		const guildLanguage = await getGuildLanguage(interaction.guild?.id ?? '');

		if (modulePrivacyPolicyData.collectedData || modulePrivacyPolicyData.sharingData) {
			const userPrivacyPolicyConfirmation = await this._getUserPrivacyPolicyConfirmation(interaction, moduleName, guildLanguage);

			if (userPrivacyPolicyConfirmation === 'deny') {
				await interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.REQUEST_PROCCES_CANCELED, guildLanguage) });
				return;
			}
		}
		
		const request = new IntegrationRequest(interaction, moduleName);
		await request.send(channelsIds.requestsToIntegrateBaseChannelId, guildsIds.hubGuildId);
	}

	private static async _getUserPrivacyPolicyConfirmation(interaction: RepliableInteraction, moduleName: GuildModules, guildLanguage: LocalizationsLanguages): Promise<UserConfirmationsAnswers> {
		const modulePrivacyPolicyData = modulesPrivacyPolicyData[moduleName];

		return await getUserConfirmation(interaction, {
			content: 
			getLocalizationForText(TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_WARNING_TEXT, guildLanguage)
			+'\n'
			+ (
				modulePrivacyPolicyData.collectedData
				? (
					getLocalizationForText(TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_COLLECTED_DATA, guildLanguage)
					+ getLocalizationForText(modulePrivacyPolicyData.collectedData, guildLanguage)
					+ '\n'
				) : ''
			) + (
				modulePrivacyPolicyData.sharingData
				? (
					getLocalizationForText(TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_SHARING_DATA, guildLanguage)
					+ getLocalizationForText(modulePrivacyPolicyData.sharingData, guildLanguage)
					+ '\n'
				) : ''
			) + getLocalizationForText(TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_LINKS, guildLanguage),
			labels: {
				confirm: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_CONTINUE,
				deny: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_DECLINE
			},
			language: guildLanguage
		})
	}

	public static async changeModuleState(guildId: Snowflake, moduleName: GuildModules, state: boolean): Promise<void> {
		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(guildId, moduleName, true);
		await CommandsIniter.changeCommandsForGuild(guildId);
	}
}
