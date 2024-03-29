import { Snowflake } from "discord.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";
import { GuildModules, MongoBase } from "../../index.js";

export class RequestsToIntegrateBase {
	private static _instance: RequestsToIntegrateBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<RequestToIntegrateBase>;
	private _localBase: Map<Snowflake, RequestToIntegrateBase> = new Map();

	constructor() {
		if (RequestsToIntegrateBase._instance) return RequestsToIntegrateBase._instance;
		RequestsToIntegrateBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<RequestToIntegrateBase>(process.env.DB_REQUESTS_TO_INTEGRATE_MODULES);
	}

	public async init(): Promise<void> {
		return this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<RequestToIntegrateBase | null> {
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

	public async addRequest(guildId: Snowflake, moduleName: GuildModules, data: RequestData): Promise<UpdateResult> {
		const requestsById = (await this.getByGuildId(guildId) ?? { guildId, requests: { [moduleName]: data } });
		requestsById.requests[moduleName] = data;

		this._localBase.set(guildId, requestsById);

		return await this._collection.updateOne(
			{ guildId: guildId },
			{ $set: requestsById },
			{ upsert: true }
		);
	}

	public async removeRequest(guildId: Snowflake, moduleName: GuildModules): Promise<UpdateResult | null> {
		const requestsById = await this.getByGuildId(guildId);

		if (!requestsById || !requestsById.requests[moduleName]) return null;

		const filteredRequestsEntries = Object.entries(requestsById.requests).filter(([key]) => (key !== String(moduleName)));
		requestsById.requests = Object.fromEntries(filteredRequestsEntries);

		this._localBase.set(guildId, requestsById);

		return await this._collection.updateOne(
			{ guildId: guildId },
			{ $set: requestsById },
			{ upsert: true }
		);
	}
}

interface RequestToIntegrateBase {
	guildId: Snowflake;
	requests: Partial<Record<GuildModules, RequestData>>;
}

export interface RequestData {
	guildId: Snowflake;
	requestMessageId: Snowflake;
	senderChannelId: Snowflake;
	moduleName: GuildModules;
}
