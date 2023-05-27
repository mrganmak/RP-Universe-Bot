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
		@SlashOption({
			name,
			description,
			nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'name', [LocalizationsLanguages.EN]),
			descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.TEST, 'description', [LocalizationsLanguages.EN]),
			required: true,
			type: ApplicationCommandOptionType.String
		})
		test: string,
		interaction: CommandInteraction
	) {
		const base = new GuildsIdentifiersBase();
		const keyHash = createHash('sha512').update(test).digest('hex');
		const guildIdentifiers = await base.getByAPIKey(keyHash);

		interaction.reply({ content: (guildIdentifiers ? 'yes' : 'no'), ephemeral: true });
	}
}
