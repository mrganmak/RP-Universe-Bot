import { BusCommandName, CommandHandler, RequirePermissions, Result, TOKENS, UseModules, OpenTicketInput, OpenTicketOutput } from "@src/index.js";
import { Client, PermissionFlagsBits } from "discord.js";
import { inject, injectable } from "tsyringe";

// Пример функционального гуарда для динамической проверки
async function checkChannelPermissions(input: OpenTicketInput): Promise<boolean> {
	// Здесь можно реализовать любую логику проверки
	// Например, проверить права на конкретном канале
	// или получить данные из БД и проверить роль пользователя
	
	const { interaction, guildId, userId } = input;
	
	// Пример: проверяем, что пользователь имеет роль "Support"
	// В реальности здесь будет обращение к БД или Discord API
	const member = await interaction.guild?.members.fetch(userId);
	if (!member) return false;
	
	// Проверяем наличие роли "Support" (пример)
	const hasSupportRole = member.roles.cache.some(role => role.name === "Support");
	
	return hasSupportRole;
}

@UseModules()
@BusCommandName('Ticket.Open')
// Можно использовать как функциональный гуард:
@RequirePermissions(checkChannelPermissions)
// Или как обычные права доступа:
// @RequirePermissions(PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel)
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
