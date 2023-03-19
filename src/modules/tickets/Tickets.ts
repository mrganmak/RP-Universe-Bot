import { Snowflake } from "discord.js";
import { Ticket } from "../../index.js";

export class Tickets {
	private static _tickets: Map<Snowflake, Ticket> = new Map();

	public static async create(): Promise<Ticket> {
		const ticket = new Ticket();
		//this._tickets.set();
		return ticket;
	}
}
