import { Snowflake } from "discord.js";
import { InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";
import { GuildModules } from "../../index.js";

export class GuildsModulesBase extends BaseCollection<GuildModulesBase> {
	constructor() {
		super(process.env.DB_GUILDS_MODULES);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<GuildModulesBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<GuildModulesBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const settings = await this._collection.findOne({ guildId });
		if (!settings) return null;

		this.setToCache(guildId, settings);
		return settings;
	}

	public async changeModuleState<K extends GuildModules>(guildId: Snowflake, key: K, value: GuildModulesBase[K]): Promise<InsertOneResult<GuildModulesBase> | UpdateResult> {
		const modulesById = await this.getByGuildId(guildId);

		if (modulesById) {
			modulesById[key] = value;
			this.setToCache(guildId, modulesById);

			return await this._collection.updateOne(
				{ guildId: guildId },
				{ $set: modulesById },
				{ upsert: true }
			);
		} else {
			const modules = {
				guildId: guildId,
				[key]: value
			} as GuildModulesBase;
			
			const result = await this._collection.insertOne(modules);
			this.setToCache(guildId, { ...modules, _id: result.insertedId });
			return result;
		}
	}
}

interface GuildModulesBase extends Partial<Record<GuildModules, boolean>> {
	guildId: Snowflake;
}
