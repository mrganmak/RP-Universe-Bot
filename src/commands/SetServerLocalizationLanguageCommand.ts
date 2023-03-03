import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashChoiceType, SlashOption } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import GuildsLocalizationSettingsBase from "../Databases/bases_list/GuildsLocalizationSettingsBase.js";
import { getLocalizationForText } from "../localizations/text/index.js";
import EDefaultTextLocalization from "../localizations/text/list/default.js";
import { getGuildLanguage } from "../localizations/index.js";

const { name, description, languageChooseName, languageChooseDescription } = getLocalizationForCommand(ECommandsIds.SET_SERVER_LANGUAGE, ELocalizationsLanguages.EN);

const choises: Array<SlashChoiceType<string, string | ELocalizationsLanguages>> = Object.entries(ELocalizationsLanguages).map(([ name, value ]) => ({ name, value }));

@Discord()
class SetServerLanguageCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'description', [ELocalizationsLanguages.EN]),
		dmPermission: false
	})
	async setServerLanguage(
		@SlashChoice(...choises)
		@SlashOption({
			name: languageChooseName,
			description: languageChooseDescription,
			required: true,
			type: ApplicationCommandOptionType.String,
			nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'languageChooseName', [ELocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'languageChooseDescription', [ELocalizationsLanguages.EN])
		})
		language: ELocalizationsLanguages,
		interaction: CommandInteraction
	) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });

		const base = new GuildsLocalizationSettingsBase();
		await base.addSettings({ guildId: interaction.guild.id, language });

		interaction.editReply({ content: getLocalizationForText(EDefaultTextLocalization.SET_SERVER_LANGUAGE_MESSAGE_TEXT, await getGuildLanguage(interaction.guild.id)) });
	}
}
