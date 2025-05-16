import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { BaseCollection } from "../MongoBase.js";
import { Snowflake } from "discord.js";

export class GuildsTicketsBase extends BaseCollection<GuildTicketsBase> {
	constructor() {
		super(process.env.DB_GUILDS_TICKETS);
	}

	protected getCacheKey(doc: WithId<GuildTicketsBase>): string {
		return doc.guildId;
	}

	public async getTicketsByGuildId(guildId: Snowflake): Promise<WithId<GuildTicketsBase> | null> {
		const cached = await this.getFromCache(guildId);
		if (cached) return cached;

		const tickets = await this._collection.findOne({ guildId });
		if (!tickets) return null;

		this.setToCache(guildId, tickets);
		return tickets;
	}

	public async getTicketByChannelId(guildId: Snowflake, channelId: Snowflake): Promise<TicketData | null> {
		const ticketsById = await this.getTicketsByGuildId(guildId);
		if (!ticketsById) return null;
		const ticket = ticketsById.tickets.filter((ticket) => (ticket.ticketChannelId === channelId));

		return ticket[0] ?? null;
	}

	public async addGuild(guildTickets: GuildTicketsBase): Promise<InsertOneResult<GuildTicketsBase>> {
		const ticketsById = await this.getTicketsByGuildId(guildTickets.guildId);

		if (ticketsById) throw new Error('I cant add ticket with same property');

		const result = await this._collection.insertOne(guildTickets);
		this.setToCache(guildTickets.guildId, { ...guildTickets, _id: result.insertedId });
		return result;
	}

	public async deleteTicketsByGuildId(guildId: Snowflake): Promise<DeleteResult> {
		const result = await this._collection.deleteOne({ guildId });
		this.removeFromCache(guildId);
		return result;
	}

	public async changeTicketForGuild(guildId: Snowflake, ticket: TicketData): Promise<UpdateResult | InsertOneResult<GuildTicketsBase> | void> {
		return await this.addTicketForGuild(guildId, ticket);
	}

	public async addTicketForGuild(guildId: Snowflake, ticket: TicketData): Promise<UpdateResult | InsertOneResult<GuildTicketsBase> | void> {
		const guildTickets = await this.getTicketsByGuildId(guildId);
		if (!guildTickets) return;

		const existedTicket = this._findTicketInGuildTicketsByChannelId(ticket.ticketChannelId, guildTickets.tickets);
		if (existedTicket) {
			existedTicket.ticketChannelId = ticket.ticketChannelId;
			existedTicket.authorId = ticket.authorId;
		} else {
			guildTickets.tickets.push(ticket);
			guildTickets.counter++;
		}

		this.setToCache(guildId, guildTickets);
		return await this._collection.updateOne(
			{ guildId },
			{ $set: guildTickets },
			{ upsert: false }
		);
	}

	private _findTicketInGuildTicketsByChannelId(ticketChannelId: Snowflake, tickets: TicketData[]): TicketData | undefined {
		for (const ticket of tickets) {
			if (ticket.ticketChannelId === ticketChannelId) return ticket;
		}

		return undefined;
	}

	public async deleteTicketFromGuildByChannelId(guildId: Snowflake, ticketChannelId: Snowflake): Promise<UpdateResult | null> {
		const guildTickets = await this.getTicketsByGuildId(guildId);
		if (!guildTickets) return null;

		guildTickets.tickets = guildTickets.tickets.filter((ticket) => (ticket.ticketChannelId !== ticketChannelId));
		
		this.setToCache(guildId, guildTickets);
		return await this._collection.updateOne(
			{ guildId },
			{ $set: guildTickets },
			{ upsert: false }
		);
	}
}

export interface GuildTicketsBase {
	guildId: Snowflake;
	counter: number;
	options: GuildTicketsOptions;
	tickets: TicketData[];
}

export interface GuildTicketsOptions {
	categories: TicketCategory[];
	ticketsCategoryId: Snowflake;
	adminsRolesIds: Snowflake[];
}

export interface TicketCategory {
	name: string;
	description?: string;
	channelName?: string;
	ticketStartText?: string;
}

export interface TicketData {
	authorId: Snowflake;
	ticketChannelId: Snowflake;
	buttonsPanelCategory: string;
	ticketVoiceChannelId?: Snowflake
}

