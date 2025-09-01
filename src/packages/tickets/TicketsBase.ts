import { Snowflake } from "discord.js";
import { BaseCollection, BaseValue } from "../shared/db/index.js";
import { singleton } from "tsyringe";

@singleton()
export class TicketsBase extends BaseCollection<GuildTicketsBase> {
	constructor() {
		super(process.env.DB_GUILDS_TICKETS);
	}

	protected _getStandartKey(): keyof GuildTicketsBase {
		return 'guildId';
	}
}

export type GuildTicketsValue = BaseValue<GuildTicketsBase>;

export interface GuildTicketsBase {
	guildId: Snowflake;
	counter: number;
	options: GuildTicketsOptions;
	tickets: TicketData[];
}

interface GuildTicketsOptions {
	categories: TicketCategory[];
	ticketsCategoryId: Snowflake;
	adminsRolesIds: Snowflake[];
}

interface TicketCategory {
	name: string;
	description?: string;
	channelName?: string;
	ticketStartText?: string;
}

interface TicketData {
	authorId: Snowflake;
	ticketChannelId: Snowflake;
	buttonsPanelCategory: string;
	ticketVoiceChannelId?: Snowflake
}
