import { RepliableInteraction, Snowflake } from "discord.js";

interface BaseInput {
	interaction: RepliableInteraction;
}

export interface OpenTicketInput extends BaseInput {
	guildId: Snowflake; userId: Snowflake; subject?: string; categoryId?: string;
}

export interface OpenTicketOutput { channelId: Snowflake }

export interface ModulesCommandsList {
	'Ticket.Open': { In: OpenTicketInput, Out: OpenTicketOutput }
}
