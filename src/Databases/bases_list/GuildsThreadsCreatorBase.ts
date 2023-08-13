import { Snowflake } from "discord.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";
import { MongoBase } from "../../index.js";

export class GuildsThreadsCreatorBase {
	private static _instance: GuildsThreadsCreatorBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildThreadsCreatorSettingsBase>;
	private _localBase: Map<Snowflake, GuildThreadsCreatorSettingsBase> = new Map();

	constructor() {
		if (GuildsThreadsCreatorBase._instance) return GuildsThreadsCreatorBase._instance;
		GuildsThreadsCreatorBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildThreadsCreatorSettingsBase>(process.env.DB_GUILDS_THREADS_CREATOR_SETTINGS);

		this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<GuildThreadsCreatorSettingsBase | null> {
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

	public async addSettings(settings: GuildThreadsCreatorSettingsBase): Promise<InsertOneResult<GuildThreadsCreatorSettingsBase> | UpdateResult> {
		const settingsById = await this.getByGuildId(settings.guildId);
		this._localBase.set(settings.guildId, settings);

		if (settingsById) {
			return await this._collection.updateOne(
				{ guildId: settings.guildId },
				{ $set: settings },
				{ upsert: true }
			);
		} else {
			return await this._collection.insertOne(settings);
		}
	}

	public async changeSettings(settings: GuildThreadsCreatorSettingsBase): Promise<UpdateResult | null> {
		const settingsById = await this.getByGuildId(settings.guildId);

		if (!settingsById) return null;

		this._localBase.set(settings.guildId, settings);
		return await this._collection.updateOne(
			{ guildId: settings.guildId },
			{ $set: settings },
			{ upsert: false }
		);
	}
}

interface GuildThreadsCreatorSettingsBase {
	guildId: Snowflake;
	creators: GuildCreators;
}

interface GuildCreators {
	[channelId: Snowflake]: GuildCreator;
}

interface GuildCreator {
	channelId: Snowflake;
	title?: string;
};
