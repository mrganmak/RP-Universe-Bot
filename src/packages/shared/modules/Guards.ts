import { inject, injectable } from "tsyringe";
//import type { GuildSettingsRepo } from "../infra/Repos";
import { GuildPolicy, Guard, Result } from "@src/index.js";
import { PermissionFlagsBits } from "discord.js";
import { TOKENS } from "../di/tokens.js";

const CanManageChannels = [
	PermissionFlagsBits.ManageChannels,
	PermissionFlagsBits.ViewChannel,
	PermissionFlagsBits.SendMessages,
];

@injectable()
export class ModuleEnabledGuard<T extends { guildId: string }> implements Guard<T> {
	private moduleName: string = '';

	constructor(
		//@inject(TOKENS.GuildSettingsBase) private repo: GuildSettingsBase
	) {}
	async check(input: T): Promise<Result<true>> {
		//const isOk = await this.repo.isModuleEnabled(input.guildId, this.moduleName);
		//return isOk ? { ok: true, value: true } : { ok: false, error: "MODULE_DISABLED" };
		return { ok: true, value: true };
	}

	configure({ moduleName }: { moduleName: string }): void {
		this.moduleName = moduleName;
	}
}

@injectable()
export class BotPermissionsGuard<T extends { guildId: string }> implements Guard<T> {
	private requiredPermissions: bigint[] = CanManageChannels

	constructor(
		@inject(TOKENS.GuildPolicy) private policy: GuildPolicy,
	) {}

	async check(input: T): Promise<Result<true>> {
		return this.policy.ensureBotPermissions(input.guildId, this.requiredPermissions);
	}

	configure({ required }: { required: bigint[] }): void {
		this.requiredPermissions = required;
	}
}
