import { Snowflake } from "discord.js";
import MongoBase from "../MongoBase.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";
import { ELocalizationsLanguages } from "../../enum.js";

export default class GuildsLocalizationSettingsBase {
	private static _instance: GuildsLocalizationSettingsBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<IGuildsLocalizationSettingsBase>;
	private _localBase: Map<Snowflake, IGuildsLocalizationSettingsBase> = new Map();

	constructor() {
		if (GuildsLocalizationSettingsBase._instance) return GuildsLocalizationSettingsBase._instance;
		GuildsLocalizationSettingsBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<IGuildsLocalizationSettingsBase>(process.env.DB_GUILDS_LOCALIZATION_SETTINGS);

		this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<IGuildsLocalizationSettingsBase | null> {
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

	public async addSettings(settings: IGuildsLocalizationSettingsBase): Promise<InsertOneResult<IGuildsLocalizationSettingsBase> | UpdateResult> {
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

	public async changeSettings(settings: IGuildsLocalizationSettingsBase): Promise<UpdateResult | null> {
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

interface IGuildsLocalizationSettingsBase {
	guildId: Snowflake;
	language: ELocalizationsLanguages;
}
