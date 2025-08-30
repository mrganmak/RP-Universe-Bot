import { APISelectMenuOption, ChatInputCommandInteraction, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getLocalizationForText,
	TextsLocalizationsIds,
	getAllLocalizationsForText,
	PaginationSelectMenu,
	GuildsLocalizationSettingsBase,
	GuildsModulesBase,
	CommandsIniter,
	GuildModules,
	getUserConfirmation,
	UserConfirmationsAnswers
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.START, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.ONLY_IN_NOT_INITED_GUILDS)
class StartCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild || !interaction.isRepliable()) return;

		await this._sendWelcomeText(interaction);

		const language = await this._getLocalizationLanguageFromUser(interaction);
		if (!language) return;

		const privacyPolicyConfirmation = await this._getUserPrivacyPolicyConfirmation(interaction, language);
		await this._handleConfirmationAnswer(interaction, language, privacyPolicyConfirmation);
	}

	private async _sendWelcomeText(interaction: CommandInteraction): Promise<void> {
		const content = [
			...getAllLocalizationsForText(TextsLocalizationsIds.START_ABOUT_ME, { isLangugageEmojiNeeded: true }),
			...getAllLocalizationsForText(TextsLocalizationsIds.START_CHOOSE_LANGUAGE, { isLangugageEmojiNeeded: true })
		].join('\n\n');

		await interaction.reply({ content, ephemeral: true });
	}

	private async _getLocalizationLanguageFromUser(interaction: ChatInputCommandInteraction): Promise<LocalizationsLanguages | null> {
		const choices: APISelectMenuOption[] = Object.entries(LocalizationsLanguages).map(([label, value]) => ({ label, value }));
		const paginationSelectMenu = await PaginationSelectMenu.create(interaction, interaction.user, {
			isLocalizationRequer: false,
			choices: choices
		});
		const answerInteraction = (await paginationSelectMenu.getUserAnswer());
		if (!answerInteraction) return null; //TODO

		await answerInteraction.deferUpdate();
		const answer = answerInteraction.values[0];
		
		return answer as unknown as LocalizationsLanguages;
	}

	private async _getUserPrivacyPolicyConfirmation(interaction: ChatInputCommandInteraction, language: LocalizationsLanguages): Promise<UserConfirmationsAnswers> {
		return await getUserConfirmation(interaction, {
			content: getLocalizationForText(TextsLocalizationsIds.START_PRIVACY_POLICY, language),
			labels: {
				confirm: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_CONTINUE,
				deny: TextsLocalizationsIds.USER_CONFIRMATION_BUTTON_DECLINE
			},
			language
		});
	}

	private async _handleConfirmationAnswer(interaction: ChatInputCommandInteraction, language: LocalizationsLanguages, answer: UserConfirmationsAnswers): Promise<void> {
		if (answer === 'confirm') return await this._handleSuccessConfirmation(interaction, language);
		else return await this._handleDeclineConfirmation(interaction, language);
	}

	private async _handleSuccessConfirmation(interaction: ChatInputCommandInteraction, language: LocalizationsLanguages): Promise<void> {
		if (!interaction.guild) return;

		await this._addLanguageToBase(interaction, language);
		await this._addModuleToBase(interaction);
		await CommandsIniter.changeCommandsForGuild(interaction.guild.id);

		await interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.START_SUCCESS_FINAL, language) });
	}

	private async _addLanguageToBase(interaction: ChatInputCommandInteraction, language: LocalizationsLanguages): Promise<void> {
		if (!interaction.guild) return;

		const settingsBase = new GuildsLocalizationSettingsBase();
		await settingsBase.addSettings({ guildId: interaction.guild.id, language });
	}

	private async _addModuleToBase(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!interaction.guild) return;

		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(interaction.guild.id, GuildModules.INITED_GUILD, true);
	}

	private async _handleDeclineConfirmation(interaction: ChatInputCommandInteraction, language: LocalizationsLanguages): Promise<void> {
		if (!interaction.guild) return;

		interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.START_DECLINE_FINAL, language) });
	}
}
