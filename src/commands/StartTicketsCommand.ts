import {  CommandInteraction, PermissionsBitField } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import {
	CommandsCategirysIds,
	CommandsIds,
	LocalizationsLanguages,
	getAllLocalizationsForCommandProperty,
	getLocalizationForCommand,
	getGuildLanguage,
	TicketsCommndInteractions,
} from "../index.js";

const { name, description } = getLocalizationForCommand(CommandsIds.START_TICKETS, LocalizationsLanguages.EN);

@Discord()
@Category(CommandsCategirysIds.ONLY_WITH_TICKETS_NOT_INITED)
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
		const guildLanguage = await getGuildLanguage(interaction.guild.id);

		const category = await TicketsCommndInteractions.getSetedCategoryForTickets(interaction); //TODO: BD;
		const channel = await TicketsCommndInteractions.getSetedChannelForTickets(interaction); //TODO: BD;
		const text = await TicketsCommndInteractions.getTextForTicketsMessage(interaction);

		console.log(category.name);
		console.log(channel.name);
		console.log(text);

		//const modulesBase = new GuildsModulesBase();
		//await modulesBase.changeModuleState(interaction.guild.id, 'isTicketsModuleInited', true);
		//CommandsIniter.changeCommandsForGuild(interaction.guild.id);
	}
}
