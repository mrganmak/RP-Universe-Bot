import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import TokenGenerator from "../utils/TokenGenerator.js";
import { getGuildLanguage } from "../localizations/index.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";
import getUserConfirmation from "../modules/interactions/UserConfirmation.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.GENERATE_API_KEY, ELocalizationsLanguages.EN);

@Discord()
class GenerateAPIKeyCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.GENERATE_API_KEY, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.GENERATE_API_KEY, 'description', [ELocalizationsLanguages.EN]),
		dmPermission: false
	})
	async generateAPIKey(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });
		const base = new GuildsIdentifiersBase();
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		if ((await base.getByGuildId(interaction.guild.id))?.APIKey) {
			const userConfirmation = await getUserConfirmation(
				interaction,
				{
					content: getLocalizationForText(
						ETextsLocalizationsIds.GENERATE_API_KEY_RESET_WARNING_TEXT,
						guildLanguage
					),
					language: guildLanguage
				}	
			);

			if (userConfirmation == 'deny') return await interaction.editReply({ content: getLocalizationForText(ETextsLocalizationsIds.GENERATE_API_KEY_RESET_CANCELED_TEXT, guildLanguage) });
		}

		const APIKey = await TokenGenerator.createAPIKey();
		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_LABLE, guildLanguage))
			.setDescription(getLocalizationForText(ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_DESCRIPTION, guildLanguage))
			.setFields({
				name: getLocalizationForText(ETextsLocalizationsIds.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME, guildLanguage),
				value: APIKey.key
			});

		await base.addAPIKeyForGuild(interaction.guild.id, APIKey.hash);
		await interaction.editReply({ content: '', embeds: [embed] });
	}
}
