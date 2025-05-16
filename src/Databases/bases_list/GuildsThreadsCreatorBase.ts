import { Snowflake } from "discord.js";
import { InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";

export class GuildsThreadsCreatorBase extends BaseCollection<GuildThreadsCreatorSettingsBase> {
	constructor() {
		super(process.env.DB_GUILDS_THREADS_CREATOR_SETTINGS);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<GuildThreadsCreatorSettingsBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<GuildThreadsCreatorSettingsBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const settings = await this._collection.findOne({ guildId });
		if (!settings) return null;

		this.setToCache(guildId, settings);
		return settings;
	}

	public async addSettings(settings: GuildThreadsCreatorSettingsBase): Promise<InsertOneResult<GuildThreadsCreatorSettingsBase> | UpdateResult> {
		const settingsById = await this.getByGuildId(settings.guildId);
		this.setToCache(settings.guildId, settings as WithId<GuildThreadsCreatorSettingsBase>);

		if (settingsById) {
			return await this._collection.updateOne(
				{ guildId: settings.guildId },
				{ $set: settings },
				{ upsert: true }
			);
		} else {
			const result = await this._collection.insertOne(settings);
			this.setToCache(settings.guildId, { ...settings, _id: result.insertedId });
			return result;
		}
	}

	public async changeSettings(settings: GuildThreadsCreatorSettingsBase): Promise<UpdateResult | null> {
		const settingsById = await this.getByGuildId(settings.guildId);

		if (!settingsById) return null;

		this.setToCache(settings.guildId, settings as WithId<GuildThreadsCreatorSettingsBase>);
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
