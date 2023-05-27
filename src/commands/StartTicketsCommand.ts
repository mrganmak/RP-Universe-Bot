import {  CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategoriesIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	TicketsCommndInteractions,
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.START_TICKETS, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategoriesIds.ONLY_WITH_TICKETS_NOT_INITED)
class StartTicketsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START_TICKETS, 'name', [LocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(CommandsIds.START_TICKETS, 'description', [LocalizationsLanguages.EN]),
		defaultMemberPermissions: PermissionsBitField.Flags.Administrator
	})
	async test(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		await interaction.deferReply({ ephemeral: true });

		const settings = await TicketsCommndInteractions.getAllTicketsSettings(interaction);
		
		console.log(settings);

		//const modulesBase = new GuildsModulesBase();
		//await modulesBase.changeModuleState(interaction.guild.id, 'isTicketsModuleInited', true);
		//CommandsIniter.changeCommandsForGuild(interaction.guild.id);
	}
}
