import { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { Category, EnumChoice } from "@discordx/utilities";
import {
	CommandsCategirysIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getGuildLanguage,
	getLocalizationForText,
	TextsLocalizationsIds,
	GuildsLocalizationSettingsBase
} from "../index.js";

const { name, description, languageChooseName, languageChooseDescription } = getLocalizationForCommand(CommandsIds.SET_SERVER_LANGUAGE, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategirysIds.ONLY_IN_INITED_GUILDS)
class SetServerLanguageCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.SET_SERVER_LANGUAGE, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.SET_SERVER_LANGUAGE, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async setServerLanguage(
		@SlashChoice(...EnumChoice(LocalizationsLanguages))
		@SlashOption({
			name: languageChooseName,
			description: languageChooseDescription,
			required: true,
			type: ApplicationCommandOptionType.String,
			nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.SET_SERVER_LANGUAGE, 'languageChooseName', [LocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.SET_SERVER_LANGUAGE, 'languageChooseDescription', [LocalizationsLanguages.EN]),
		})
		language: LocalizationsLanguages,
		interaction: CommandInteraction
	) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });

		const base = new GuildsLocalizationSettingsBase();
		await base.addSettings({ guildId: interaction.guild.id, language });

		interaction.editReply({ content: getLocalizationForText(TextsLocalizationsIds.SET_SERVER_LANGUAGE_MESSAGE_TEXT, await getGuildLanguage(interaction.guild.id)) });
	}
}
