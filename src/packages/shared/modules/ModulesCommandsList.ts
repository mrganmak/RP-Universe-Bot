import { Snowflake } from "discord.js";

export type OpenTicketInput = {
	guildId: Snowflake; userId: Snowflake; subject?: string; categoryId?: string;
};
export type OpenTicketOutput = { channelId: Snowflake };

export type ModulesCommandsList = {
	'Ticket.Open': { In: OpenTicketInput, Out: OpenTicketOutput }
}
