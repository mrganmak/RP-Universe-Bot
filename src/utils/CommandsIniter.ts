import { ICategory } from "@discordx/utilities";
import { Snowflake } from "discord.js";
import { Client, DApplicationCommand, MetadataStorage } from "discordx";
import { ECommandsCategirysIds } from "../enum.js";
import GuildsModulesBase from "../Databases/bases_list/GuildsModulesBase.js";
import Util from "./Util.js";

export default class CommandsIniter {
	private static _client: Client;
	private static _guildsScopes: IGuildsScopes = {
		initedGuilds: new Set(),
		notInitedGuilds: new Set(),
		guildsWithInitedTickets: new Set(),
		guildsWithNotInitedTickets: new Set()
	};

	public static changeClient(client: Client): void {
		this._client = client;
	}

	public static async initCommands(): Promise<void> {
		await this._initScopes();

		this._changeCommands();
	
		await this._client.initApplicationCommands();
	}

	private static _changeCommands(): void {
		const commands = MetadataStorage.instance.applicationCommands;

		for (const command of commands as unknown as Array<DApplicationCommand & ICategory>) {
			command.dmPermission = false;
	
			if (command.category == ECommandsCategirysIds.DEVELOPMENT) {
				command.guilds = [process.env.TEST_GUILD_ID];
			} else if (command.category == ECommandsCategirysIds.ONLY_IN_INITED_GUILDS) {
				command.guilds = [process.env.TEST_GUILD_ID, ...Array.from(this._guildsScopes.initedGuilds)];
			} else if (command.category == ECommandsCategirysIds.ONLY_IN_NOT_INITED_GUILDS) {
				command.guilds = [process.env.TEST_GUILD_ID, ...Array.from(this._guildsScopes.notInitedGuilds)];
			} else if (command.category == ECommandsCategirysIds.ONLY_WITH_TICKETS_INITED) {
				command.guilds = [process.env.TEST_GUILD_ID, ...Array.from(this._guildsScopes.guildsWithInitedTickets)];
			} else if (command.category == ECommandsCategirysIds.ONLY_WITH_TICKETS_NOT_INITED) {
				command.guilds = [process.env.TEST_GUILD_ID, ...Array.from(this._guildsScopes.guildsWithNotInitedTickets)];
			}

			Util.debug(`Command ${command.name} inited`);
			Util.debug(command.guilds);
		}
	}

	private static async _initScopes(): Promise<void> {
		const guilds = await this._client.guilds.fetch();

		for (const [id, _] of guilds) {
			await this._initScopesForGuild(id);
		}
	}

	private static async _initScopesForGuild(guildId: Snowflake): Promise<void> {
		const base = new GuildsModulesBase();

		const guildModules = await base.getByGuildId(guildId);

		if (guildModules?.isGuildInited) {
			if (!this._guildsScopes.initedGuilds.has(guildId)) this._guildsScopes.initedGuilds.add(guildId);
			if (this._guildsScopes.notInitedGuilds.has(guildId)) this._guildsScopes.notInitedGuilds.delete(guildId);
		} else {
			if (!this._guildsScopes.notInitedGuilds.has(guildId)) this._guildsScopes.notInitedGuilds.add(guildId);
			if (this._guildsScopes.initedGuilds.has(guildId)) this._guildsScopes.initedGuilds.delete(guildId);
			return;
		}

		if (guildModules?.isTicketsModuleInited) {
			if (!this._guildsScopes.guildsWithInitedTickets.has(guildId)) this._guildsScopes.guildsWithInitedTickets.add(guildId);
			if (this._guildsScopes.guildsWithNotInitedTickets.has(guildId)) this._guildsScopes.guildsWithNotInitedTickets.delete(guildId);
		} else {
			if (!this._guildsScopes.guildsWithNotInitedTickets.has(guildId)) this._guildsScopes.guildsWithNotInitedTickets.add(guildId);
			if (this._guildsScopes.guildsWithInitedTickets.has(guildId)) this._guildsScopes.guildsWithInitedTickets.delete(guildId);
		}
	}

	public static async changeCommandsForGuild(guildId: Snowflake): Promise<void> {
		await this._initScopesForGuild(guildId);
		this._changeCommands();
		await this._client.initApplicationCommands();
	}
}

interface IGuildsScopes {
	initedGuilds: Set<Snowflake>;
	notInitedGuilds: Set<Snowflake>;
	guildsWithInitedTickets: Set<Snowflake>;
	guildsWithNotInitedTickets: Set<Snowflake>;
}
