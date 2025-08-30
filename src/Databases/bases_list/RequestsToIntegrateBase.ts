import { Snowflake } from "discord.js";
import { InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";
import { GuildModules } from "../../index.js";

export class RequestsToIntegrateBase extends BaseCollection<RequestToIntegrateBase> {
	constructor() {
		super(process.env.DB_REQUESTS_TO_INTEGRATE_MODULES);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<RequestToIntegrateBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<RequestToIntegrateBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const settings = await this._collection.findOne({ guildId });
		if (!settings) return null;

		this.setToCache(guildId, settings);
		return settings;
	}

	public async addRequest(guildId: Snowflake, moduleName: GuildModules, data: RequestData): Promise<UpdateResult> {
		const requestsById = await this.getByGuildId(guildId);
		const newRequests = requestsById ?? { 
			_id: new ObjectId(),
			guildId, 
			requests: { [moduleName]: data } 
		};
		
		newRequests.requests[moduleName] = data;
		this.setToCache(guildId, newRequests);

		return await this._collection.updateOne(
			{ guildId: guildId },
			{ $set: newRequests },
			{ upsert: true }
		);
	}

	public async removeRequest(guildId: Snowflake, moduleName: GuildModules): Promise<UpdateResult | null> {
		const requestsById = await this.getByGuildId(guildId);

		if (!requestsById || !requestsById.requests[moduleName]) return null;

		const filteredRequestsEntries = Object.entries(requestsById.requests).filter(([key]) => (key !== String(moduleName)));
		requestsById.requests = Object.fromEntries(filteredRequestsEntries);

		this.setToCache(guildId, requestsById);

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
