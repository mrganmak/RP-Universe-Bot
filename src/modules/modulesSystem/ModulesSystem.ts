import { RepliableInteraction, Snowflake } from "discord.js";
import { CommandsIniter, GuildModules, GuildsModulesBase, IntegrationRequest, channelsIds, guildsIds } from "../../index.js";

export class ModulesSystem {
	public static async requestToIntegrateModule(interaction: RepliableInteraction, moduleName: GuildModules): Promise<void> {
		const request = new IntegrationRequest(interaction, moduleName);
		await request.send(channelsIds.requestsToIntegrateBaseChannelId, guildsIds.hubGuildId);
	}

	public static async changeModuleState(guildId: Snowflake, moduleName: GuildModules, state: boolean): Promise<void> {
		const modulesBase = new GuildsModulesBase();
		await modulesBase.changeModuleState(guildId, moduleName, true);
		await CommandsIniter.changeCommandsForGuild(guildId);
	}
}
