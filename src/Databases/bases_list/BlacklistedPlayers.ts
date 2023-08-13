import { Snowflake } from "discord.js";
import { Collection, DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { MongoBase } from "../../index.js";

export class BlacklistedPlayers {
	private static _instance: BlacklistedPlayers | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<BlacklistedPlayersBase>;

	constructor() {
		if (BlacklistedPlayers._instance) return BlacklistedPlayers._instance;
		BlacklistedPlayers._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<BlacklistedPlayersBase>(process.env.DB_GUILDS_IDENTIFIRES);
	}

	public async getByUserId(userId: Snowflake): Promise<BlacklistedPlayersBase | null> {
		const settings = await this._collection.findOne({ userId });

		if (!settings) return null;

		return settings;
	}

	public async addUser(data: BlacklistedPlayersBase): Promise<InsertOneResult<BlacklistedPlayersBase> | UpdateResult | undefined> {
		const playerDataById = await this.getByUserId(data.userId);

		if (playerDataById) {
			if (this._hasBlockContainsGuilds(playerDataById.blocks, data.blocks)) {
				const filteredBlocks = this._getBlocsWithoutGuilds(data.blocks, playerDataById.blocks);

				if (filteredBlocks.length <= 0) return;

				playerDataById.blocks = [...playerDataById.blocks, ...filteredBlocks];
			} else playerDataById.blocks = [...playerDataById.blocks, ...data.blocks];

			return await this._collection.updateOne(
				{ guildId: data.userId },
				{ $set: playerDataById },
				{ upsert: true }
			);
		} else {
			return await this._collection.insertOne(data);
		}
	}

	public async deleteUser(data: BlacklistedPlayersBase): Promise<InsertOneResult<BlacklistedPlayersBase> | UpdateResult | undefined> {
		const playerDataById = await this.getByUserId(data.userId);

		if (!playerDataById || !this._hasBlockContainsGuilds(playerDataById.blocks, data.blocks)) return;

		playerDataById.blocks = this._getBlocsWithoutGuilds(playerDataById.blocks, data.blocks);

		return await this._collection.updateOne(
			{ guildId: data.userId },
			{ $set: playerDataById },
			{ upsert: true }
		);
	}

	private _hasBlockContainsGuilds(instanceBlocks: BlockData[], blocksForSearch: BlockData[]): boolean {
		for (const { guildId } of blocksForSearch) {
			const filteredBlocks = instanceBlocks.filter((block) => (block.guildId === guildId));

			if (filteredBlocks.length > 0) return true;
		}

		return false;
	}

	private _getBlocsWithoutGuilds(instanceBlocks: BlockData[], blocksForFilter: BlockData[]): BlockData[] {
		const guildsForFilter: Snowflake[] = blocksForFilter.map((block) => (block.guildId));

		return (instanceBlocks.filter(({ guildId }) => (!guildsForFilter.includes(guildId))));
	}
}

interface BlacklistedPlayersBase {
	userId: Snowflake;
	blocks: BlockData[];
}

interface BlockData {
	guildId: Snowflake;
	reason: Snowflake;
}
