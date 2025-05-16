import { EmojiResolvable, HexColorString, Snowflake } from "discord.js";
import { Collection, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";

export class GuildsReSendingsBase extends BaseCollection<GuildReSendingsBase> {
	constructor() {
		super(process.env.DB_GUILDS_RE_SENDING_SETTINGS);
		this.initCache();
	}

	protected getCacheKey(doc: WithId<GuildReSendingsBase>): string {
		return doc.guildId;
	}

	public async getByGuildId(guildId: Snowflake): Promise<WithId<GuildReSendingsBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const settings = await this._collection.findOne({ guildId });
		if (!settings) return null;

		this.setToCache(guildId, settings);
		return settings;
	}

	public async addSettings(settings: GuildReSendingsBase): Promise<InsertOneResult<GuildReSendingsBase> | UpdateResult> {
		const settingsById = await this.getByGuildId(settings.guildId);
		this.setToCache(settings.guildId, settings as WithId<GuildReSendingsBase>);

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

	public async changeSettings(settings: GuildReSendingsBase): Promise<UpdateResult | null> {
		const settingsById = await this.getByGuildId(settings.guildId);

		if (!settingsById) return null;

		this.setToCache(settings.guildId, settings as WithId<GuildReSendingsBase>);
		return await this._collection.updateOne(
			{ guildId: settings.guildId },
			{ $set: settings },
			{ upsert: false }
		);
	}
}

interface GuildReSendingsBase {
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
