import { Snowflake } from "discord.js";
import MongoBase from "../MongoBase.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";

export default class GuildsModulesBase {
	private static _instance: GuildsModulesBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildModulesBase>;
	private _localBase: Map<Snowflake, GuildModulesBase> = new Map();

	constructor() {
		if (GuildsModulesBase._instance) return GuildsModulesBase._instance;
		GuildsModulesBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildModulesBase>(process.env.DB_GUILDS_MODULES);

		this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<GuildModulesBase | null> {
		const localData = this._localBase.get(guildId);

		if (localData) {
			return localData;
		} else {
			const settings = await this._collection.findOne({ guildId });

			if (!settings) return null;

			this._localBase.set(settings.guildId, settings);
			return settings;
		}
	}

	public async changeModuleState<K extends keyof GuildModulesBase>(guildId: Snowflake, key: K, value: GuildModulesBase[K]): Promise<InsertOneResult<GuildModulesBase> | UpdateResult> {
		const modulesById = await this.getByGuildId(guildId);

		if (modulesById) {
			modulesById[key] = value;

			this._localBase.set(guildId, modulesById);

			return await this._collection.updateOne(
				{ guildId: guildId },
				{ $set: modulesById },
				{ upsert: true }
			);
		} else {
			const modules = {
				guildId: guildId,
				[key]: value
			}
			this._localBase.set(guildId, modules);
			return await this._collection.insertOne(modules);
		}
	}
}

interface GuildModulesBase {
	guildId: Snowflake;
	isGuildInited?: boolean;
	isTicketsModuleInited?: boolean;
}
