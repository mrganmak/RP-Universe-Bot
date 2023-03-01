import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsId, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";

const { name, description } = getLocalizationForCommand(ECommandsId.PING, ELocalizationsLanguages.EN);

@Discord()
class PingCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsId.PING, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsId.PING, 'description', [ELocalizationsLanguages.EN]),
	})
	async test(interaction: CommandInteraction) {
		interaction.reply({ content: `🏓 | Задержка апи: ${Math.round(interaction.client.ws.ping)}ms`, ephemeral: true });
	}
}
