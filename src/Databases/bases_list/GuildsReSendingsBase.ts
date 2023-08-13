import { EmojiResolvable, HexColorString, Snowflake } from "discord.js";
import { Collection, InsertOneResult, UpdateResult } from "mongodb";
import { MongoBase } from "../../index.js";

export class GuildsReSendingSettingsBase {
	private static _instance: GuildsReSendingSettingsBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildReSendingSettingsBase>;
	private _localBase: Map<Snowflake, GuildReSendingSettingsBase> = new Map();

	constructor() {
		if (GuildsReSendingSettingsBase._instance) return GuildsReSendingSettingsBase._instance;
		GuildsReSendingSettingsBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildReSendingSettingsBase>(process.env.DB_GUILDS_RE_SENDING_SETTINGS);

		this._collection.find().forEach((settings) => {
			this._localBase.set(settings.guildId, settings);
		});
	}

	public async getByGuildId(guildId: Snowflake): Promise<GuildReSendingSettingsBase | null> {
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

	public async addSettings(settings: GuildReSendingSettingsBase): Promise<InsertOneResult<GuildReSendingSettingsBase> | UpdateResult> {
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

	public async changeSettings(settings: GuildReSendingSettingsBase): Promise<UpdateResult | null> {
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

interface GuildReSendingSettingsBase {
	guildId: Snowflake;
	reSenders: GuildReSenders
}

interface GuildReSenders {
	[channelId: Snowflake]: GuildReSender;
}

export type GuildReSender = GuildReSenderInEmbed | GuildReSenderInMessage;

interface GuildReSenderDefault {
	channelId: Snowflake;
	isNeedToCreateAThread: boolean;
	emojisForStartReactions?: Array<EmojiResolvable>;
	logChannelId?: string;
	webhookSettings?: WebhookSettings;
}

interface WebhookSettings {
	id: Snowflake;
	token: string
}

interface GuildReSenderInEmbed extends GuildReSenderDefault {
	isInEmbed: true;
	isAnonymously: boolean;
	colorInHex: HexColorString | 'random';
	title?: string | `{COUNTER} ${string}` | `${string} {COUNTER}` | `{COUNTER}`,
	counter?: number;
}

interface GuildReSenderInMessage extends GuildReSenderDefault {
	isInEmbed: false;
}
