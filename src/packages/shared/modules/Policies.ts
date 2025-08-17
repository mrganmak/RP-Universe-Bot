import { Client, PermissionFlagsBits } from "discord.js";

export class GuildPolicy {
	constructor(
		private client: Client
	) {}

	async ensureBotPermissions(guildId: string, permissions: bigint[]) {
		const guild = await this.client.guilds.fetch(guildId).catch(() => null);
		if (!guild) return { ok: false, error: "GUILD_NOT_FOUND" } as const;

		const me = await guild.members.fetchMe().catch(() => null);
		if (!me) return { ok: false, error: "BOT_MEMBER_NOT_FOUND" } as const;
		
		const missing = permissions.filter(p => !me.permissions.has(p));
		return (missing.length > 0 ? { ok: false, error: "BOT_PERMISSIONS_MISSING" } as const : { ok: true, value: true } as const);
	}
}
