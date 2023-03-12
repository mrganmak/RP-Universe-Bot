import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
import { Discord, Slash } from "discordx";
import { ECommandsCategirysIds, ECommandsIds, ELocalizationsLanguages } from "../enum.js";
import { getAllLocalizationsForCommandProperty, getLocalizationForCommand } from "../localizations/commands/index.js";
import { Category } from "@discordx/utilities";
import GuildsModulesBase from "../Databases/bases_list/GuildsModulesBase.js";
import CommandsIniter from "../utils/CommandsIniter.js";
import { getLocalizationForText } from "../localizations/texts/index.js";
import ETextsLocalizationsIds from "../localizations/texts/types/ETextsLocalizationsIds.js";
import { getGuildLanguage } from "../localizations/index.js";
import TicketsCommndInteractions from "../modules/tickets/utils/TicketsCommndInteractions.js";

const { name, description } = getLocalizationForCommand(ECommandsIds.START_TICKETS, ELocalizationsLanguages.EN);

@Discord()
@Category(ECommandsCategirysIds.ONLY_WITH_TICKETS_NOT_INITED)
class StartTicketsCommand {
	@Slash({
		name,
		description,
		nameLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START_TICKETS, 'name', [ELocalizationsLanguages.EN]),
		descriptionLocalizations: getAllLocalizationsForCommandProperty(ECommandsIds.START_TICKETS, 'description', [ELocalizationsLanguages.EN]),
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
