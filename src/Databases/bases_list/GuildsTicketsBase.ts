import { Collection, DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { MongoBase } from "../../index.js";
import { Snowflake } from "discord.js";

export class GuildsTicketsBase {
	private static _instance: GuildsTicketsBase | undefined;

	private _database!: typeof MongoBase['database'];
	private _collection!: Collection<GuildTicketsBase>;

	constructor() {
		if (GuildsTicketsBase._instance) return GuildsTicketsBase._instance;
		GuildsTicketsBase._instance = this;

		this._database = MongoBase.database;
		this._collection = this._database.collection<GuildTicketsBase>(process.env.DB_GUILDS_TICKETS);
	}

	public async getTicketsByGuildId(guildId: Snowflake): Promise<GuildTicketsBase | null> {
		return await this._collection.findOne({ guildId });
	}

	public async getTicketByChannelId(guildId: Snowflake, channelId: Snowflake): Promise<TicketData | null> {
		const ticketsById = await this.getTicketsByGuildId(guildId);
		if (!ticketsById) return null;
		const ticket = ticketsById.tickets.filter((ticket) => (ticket.ticketChannelId === channelId));

		return ticket[0] ?? null;
	}

	public async addGuild(guildMarkers: GuildTicketsBase): Promise<InsertOneResult<GuildTicketsBase>> {
		const ticketsById = await this.getTicketsByGuildId(guildMarkers.guildId);

		if (ticketsById) throw new Error('I cant add ticket with same property');

		return await this._collection.insertOne(guildMarkers);
	}

	public async deleteTicketsByGuildId(guildId: Snowflake): Promise<DeleteResult> {
		return await this._collection.deleteOne({ guildId });
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
		}

		guildTickets.counter++;

		return await this._collection.updateOne(
			{ guildId },
			{ $set: guildTickets },
			{ upsert: false }
		);
	}

	private _findTicketInGuildTicketsByChannelId(ticketChannelId: Snowflake, tickets: TicketData[]): TicketData | undefined {
		for (const ticket of tickets) {
			if (ticket.ticketChannelId === ticketChannelId) return ticket; //TODO: Проверить
		}

		return undefined;
	}

	public async deleteTicketFromGuildByChannelId(guildId: Snowflake, ticketChannelId: Snowflake): Promise<UpdateResult | null> {
		const guildTickets = await this.getTicketsByGuildId(guildId);
		if (!guildTickets) return null;

		guildTickets.tickets = guildTickets.tickets.filter((ticket) => (ticket.ticketChannelId !== ticketChannelId));
		guildTickets.counter--;
		
		return await this._collection.updateOne(
			{ guildId },
			{ $set: guildTickets },
			{ upsert: false }
		);
	}
}

interface GuildTicketsBase {
	guildId: Snowflake;
	ticketsCategoryId: Snowflake;
	counter: number;
	adminsRolesId: Snowflake[];
	tickets: TicketData[];
}

export interface TicketData {
	authorId: Snowflake;
	ticketChannelId: Snowflake;
	ticketVoiceChannelId?: Snowflake
}

