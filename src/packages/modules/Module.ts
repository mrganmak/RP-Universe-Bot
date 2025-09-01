import { RepliableInteraction } from "discord.js";
import { container } from "tsyringe";
import { GuildModulesValue, ModulesBase } from "./ModulesBase.js";
import { DataCollectionPoll, GuildModuleIds, ModulesErrorCodes, PollCollectedData, Result } from "../shared/index.js";

export abstract class Module {
	constructor(
		protected _moduleId: GuildModuleIds,
	) {}

	public async setup(interaction: RepliableInteraction): Promise<Result<boolean>> {
		if (!interaction.inGuild()) return { ok: false, error: ModulesErrorCodes.GuildNotFound };

		const guildModulesResult = await this._getGuildModules(interaction.guildId);
		if (!guildModulesResult.ok) return guildModulesResult;

		const guildModules = guildModulesResult.value;		
		const setupDataResult = await this._getSetupData(interaction);
		if (!setupDataResult.ok) return setupDataResult;

		const initilizeResult = await this._initilize(setupDataResult.value, interaction);
		if (!initilizeResult.ok) return initilizeResult;

		guildModules.doc[this._moduleId] = true;
		guildModules.update();

		return { ok: true, value: true };
	}

	private async _getGuildModules(guildId: string): Promise<Result<GuildModulesValue>> {
		const guildModulesBase = container.resolve(ModulesBase);
		const guildModules = await guildModulesBase.getByKey('guildId', guildId);

		if (!guildModules) return { ok: true, value: await guildModulesBase.create({ guildId }) };
		if (guildModules.doc[this._moduleId] === true) return { ok: false, error: ModulesErrorCodes.MuduleAlreadyActiveted };

		return { ok: true, value: guildModules };
	}

	private async _getSetupData(interaction: RepliableInteraction<'raw' | 'cached'>): Promise<Result<PollCollectedData>> {
		const setupPoll = this._getSetupPoll(interaction);
		const setupData = await setupPoll.collectPollData();
		if (!setupData) return { ok: false, error: ModulesErrorCodes.PollNotCollected };
		return { ok: true, value: setupData };
	}

	protected abstract _getSetupPoll(interaction: RepliableInteraction<'raw' | 'cached'>): DataCollectionPoll;
	protected abstract _getChangePoll(interaction: RepliableInteraction<'raw' | 'cached'>): DataCollectionPoll;
	protected abstract _initilize(setupData: PollCollectedData, interaction: RepliableInteraction<'raw' | 'cached'>): Promise<Result<boolean>>;
}
