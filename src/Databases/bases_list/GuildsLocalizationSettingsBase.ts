import { Snowflake } from "discord.js";
import MongoBase from "../MongoBase.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";
import { LocalizationsLanguages } from "../../enum.js";

export default class GuildsLocalizationSettingsBase {
	private static _instance: GuildsLocalizationSettingsBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildLocalizationSettingsBase>;
	private _localBase: Map<Snowflake, GuildLocalizationSettingsBase> = new Map();

	constructor() {
		if (GuildsLocalizationSettingsBase._instance) return GuildsLocalizationSettingsBase._instance;
		GuildsLocalizationSettingsBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildLocalizationSettingsBase>(process.env.DB_GUILDS_LOCALIZATION_SETTINGS);

		this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<GuildLocalizationSettingsBase | null> {
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

	public async addSettings(settings: GuildLocalizationSettingsBase): Promise<InsertOneResult<GuildLocalizationSettingsBase> | UpdateResult> {
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

	public async changeSettings(settings: GuildLocalizationSettingsBase): Promise<UpdateResult | null> {
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

interface GuildLocalizationSettingsBase {
	guildId: Snowflake;
	language: LocalizationsLanguages;
}
