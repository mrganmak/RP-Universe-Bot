import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import { getGuildLanguage } from "../localizations/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.PING, ELocalizationsLanguages.EN);

@Discord()
class PingCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.PING, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.PING, 'description', [ELocalizationsLanguages.EN]),
		dmPermission: false
	})
	async ping(interaction: CommandInteraction) {
		if (!interaction.guild) return;

		interaction.reply({
			content: getLocalizationForText(
				ETextsLocalizationsIds.PING_COMMAND_MESSAGE_TEXT,
				await getGuildLanguage(interaction.guild.id)
			).replace('{ping}', String(Math.round(interaction.client.ws.ping))),
			ephemeral: true
		});
	}
}
