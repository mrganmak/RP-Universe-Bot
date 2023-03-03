import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import TokenGenerator from "../utils/TokenGenerator.js";
import { getGuildLanguage } from "../localizations/index.js";
import { getLocalizationForText } from "../localizations/text/index.js";
import EDefaultTextLocalization from "../localizations/text/list/default.js";
import GuildsIdentifiersBase from "../Databases/bases_list/GuildsIdentifiersBase.js";

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

		const APIKey = await TokenGenerator.createAPIKey();
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const embed = new EmbedBuilder();
		embed
			.setTitle(getLocalizationForText(EDefaultTextLocalization.GENERATE_API_KEY_EMBED_TITLE, guildLanguage))
			.setDescription(getLocalizationForText(EDefaultTextLocalization.GENERATE_API_KEY_EMBED_DESCRIPTION, guildLanguage))
			.setFields({
				name: getLocalizationForText(EDefaultTextLocalization.GENERATE_API_KEY_EMBED_KEY_FIELD_NAME, guildLanguage),
				value: APIKey.key
			});

		await base.addAPIKeyForGuild(interaction.guild.id, APIKey.hash);
		await interaction.editReply({ embeds: [embed] });
	}
}
