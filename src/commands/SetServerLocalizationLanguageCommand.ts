import { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { ECommandsCategirysIds, ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import GuildsLocalizationSettingsBase from "../Databases/bases_list/GuildsLocalizationSettingsBase.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import { getGuildLanguage } from "../localizations/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";
import { Category, EnumChoice } from "@discordx/utilities";

const { name, description, languageChooseName, languageChooseDescription } = getLocalizationForCommand(ECommandsIds.SET_SERVER_LANGUAGE, ELocalizationsLanguages.EN);

@Discord()
@Category(ECommandsCategirysIds.ONLY_IN_INITED_GUILDS)
class SetServerLanguageCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'description', [ELocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async setServerLanguage(
		@SlashChoice(...EnumChoice(ELocalizationsLanguages))
		@SlashOption({
			name: languageChooseName,
			description: languageChooseDescription,
			required: true,
			type: ApplicationCommandOptionType.String,
			nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'languageChooseName', [ELocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.SET_SERVER_LANGUAGE, 'languageChooseDescription', [ELocalizationsLanguages.EN]),
		})
		language: ELocalizationsLanguages,
		interaction: CommandInteraction
	) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });

		const base = new GuildsLocalizationSettingsBase();
		await base.addSettings({ guildId: interaction.guild.id, language });

		interaction.editReply({ content: getLocalizationForText(ETextsLocalizationsIds.SET_SERVER_LANGUAGE_MESSAGE_TEXT, await getGuildLanguage(interaction.guild.id)) });
	}
}
