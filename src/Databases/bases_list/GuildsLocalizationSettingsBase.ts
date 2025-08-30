import { Snowflake } from "discord.js";
import { InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";
import { LocalizationsLanguages } from "../../index.js";

export class GuildsLocalizationSettingsBase extends BaseCollection<GuildLocalizationSettingsBase> {
	constructor() {
		super(process.env.DB_GUILDS_LOCALIZATION_SETTINGS);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<GuildLocalizationSettingsBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<GuildLocalizationSettingsBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const settings = await this._collection.findOne({ guildId });
		if (!settings) return null;

		this.setToCache(guildId, settings);
		return settings;
	}

	public async addSettings(settings: GuildLocalizationSettingsBase): Promise<InsertOneResult<GuildLocalizationSettingsBase> | UpdateResult> {
		const settingsById = await this.getByGuildId(settings.guildId);
		this.setToCache(settings.guildId, settings as WithId<GuildLocalizationSettingsBase>);

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

	public async changeSettings(settings: GuildLocalizationSettingsBase): Promise<UpdateResult | null> {
		const settingsById = await this.getByGuildId(settings.guildId);

		if (!settingsById) return null;

		this.setToCache(settings.guildId, settings as WithId<GuildLocalizationSettingsBase>);
		return await this._collection.updateOne(
			{ guildId: settings.guildId },
			{ $set: settings },
			{ upsert: false }
		);
	}
}

interface GuildLocalizationSettingsBase {
	guildId: Snowflake;
	language: LocalizationsLanguages;
}
