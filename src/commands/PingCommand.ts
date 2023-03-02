import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.PING, ELocalizationsLanguages.EN);

@Discord()
class PingCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.PING, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.PING, 'description', [ELocalizationsLanguages.EN])
	})
	async test(interaction: CommandInteraction) {
		interaction.reply({ content: `🏓 | Задержка апи: ${Math.round(interaction.client.ws.ping)}ms`, ephemeral: true });
	}
}
