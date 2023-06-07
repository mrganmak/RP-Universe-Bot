import { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { createHash } from "crypto";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	GuildsIdentifiersBase,
	GuildsReSendingSettingsBase,
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.TEST, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.DEVELOPMENT)
class TestCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(
		interaction: CommandInteraction
	) {
		if (!interaction.guild) return;
		const base = new GuildsReSendingSettingsBase();

		base.addSettings({
			guildId: '1079448420630139023',
			reSenders: {
				'1113505695887794288': {
					isInEmbed: true,
					isAnonymously: true,
					channelId: '1113505695887794288',
					colorInHex: '#522a5d',
					isNeedToCreateAThread: false
				}
			}
		});
	}
}
