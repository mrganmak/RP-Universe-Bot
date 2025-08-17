import { BusCommandName, CommandHandler, RequirePermissions, Result, TOKENS, RegisterModule } from "@src/index.js";
import { Client, Snowflake } from "discord.js";
import { inject, injectable } from "tsyringe";

export type OpenTicketInput = {
	guildId: Snowflake; userId: Snowflake; subject?: string; categoryId?: string;
};
export type OpenTicketOutput = { channelId: Snowflake };

@RegisterModule('TICKETS')
@BusCommandName('Ticket.Open')
@RequirePermissions(

)
@injectable()
export class OpenTicketHandler
	implements CommandHandler<OpenTicketInput, OpenTicketOutput> {
	constructor(
		@inject(TOKENS.Client) private client: Client
	) {}

	async execute(input: OpenTicketInput): Promise<Result<OpenTicketOutput>> {
		return { ok: true, value: { channelId: input.guildId } };
	}
}
