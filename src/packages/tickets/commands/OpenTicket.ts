import { BusCommandName, CommandHandler, RequirePermissions, Result, TOKENS, UseModules, OpenTicketInput, OpenTicketOutput } from "@src/index.js";
import { Client } from "discord.js";
import { inject, injectable } from "tsyringe";

@UseModules()
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
