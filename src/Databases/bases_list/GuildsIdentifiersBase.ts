import { Snowflake } from "discord.js";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";

export class GuildsIdentifiersBase extends BaseCollection<GuildIdentifiersBase> {
	constructor() {
		super(process.env.DB_GUILDS_IDENTIFIRES);
	}

	protected getCacheKey(doc: WithId<GuildIdentifiersBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<GuildIdentifiersBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const identifier = await this._collection.findOne({ guildId });
		if (!identifier) return null;

		this.setToCache(guildId, identifier);
		return identifier;
	}

	public async getByToken(token: string): Promise<WithId<GuildIdentifiersBase> | null> {
		return await this._collection.findOne({ token });
	}

	public async addIdentifier(identifier: GuildIdentifiersBase): Promise<InsertOneResult<GuildIdentifiersBase>> {
		const identifierById = await this.getByGuildId(identifier.guildId);
		const identifierByToken = await this.getByToken(identifier.token);

		if (identifierById || identifierByToken) throw new Error('I cant add identifier with same property');

		const result = await this._collection.insertOne(identifier);
		this.setToCache(identifier.guildId, { ...identifier, _id: result.insertedId });
		return result;
	}

	public async deleteIdentifierByGuildId(guildId: Snowflake): Promise<DeleteResult> {
		const result = await this._collection.deleteOne({ guildId });
		this.removeFromCache(guildId);
		return result;
	}

	public async deleteIdentifierByToken(token: string): Promise<DeleteResult> {
		const identifier = await this.getByToken(token);
		const result = await this._collection.deleteOne({ token });
		if (identifier) this.removeFromCache(identifier.guildId);
		return result;
	}

	public async addAPIKeyForGuild(guildId: Snowflake, APIKey: string): Promise<UpdateResult> {
		const result = await this._collection.updateOne(
			{ guildId },
			{ $set: { APIKey } },
			{ upsert: false }
		);
		
		const updated = await this.getByGuildId(guildId);
		if (updated) this.setToCache(guildId, updated);
		
		return result;
	}

	public async getByAPIKey(APIKey: string): Promise<WithId<GuildIdentifiersBase> | null> {
		return await this._collection.findOne({ APIKey });
	}
}

interface GuildIdentifiersBase {
	guildId: Snowflake;
	token: string;
	APIKey?: string;
}
