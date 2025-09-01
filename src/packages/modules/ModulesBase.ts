import { Snowflake } from "discord.js";
import { BaseCollection, BaseValue } from "../shared/db/index.js";
import { GuildModuleIds } from "../shared/index.js";
import { singleton } from "tsyringe";

@singleton()
export class ModulesBase extends BaseCollection<GuildModulesBase> {
	constructor() {
		super(process.env.DB_GUILDS_MODULES);
	}

	protected _getStandartKey(): keyof GuildModulesBase {
		return 'guildId';
	}
}

export type GuildModulesValue = BaseValue<GuildModulesBase>;

interface GuildModulesBase extends Partial<Record<GuildModuleIds, boolean>> {
	guildId: Snowflake;
}
