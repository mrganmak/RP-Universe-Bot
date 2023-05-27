import { ICategory } from "@discordx/utilities";
import { Guild, Snowflake } from "discord.js";
import { Client, DApplicationCommand, MetadataStorage } from "discordx";
import { Util, GuildsModulesBase, CommandsCategoriesIds, GuildModules } from "../index.js";

export class CommandsIniter {
	private static _client: Client;
	private static _guildsScopes: GuildsScopes = {
		initedGuilds: {
			category: CommandsCategoriesIds.ONLY_IN_INITED_GUILDS,
			guilds: new Set(),
			moduleNameInBase: GuildModules.INITED_GUILD,
			targetToggleValue: true,
			dependentScope: 'notInitedGuilds'
		},
		notInitedGuilds: {
			category: CommandsCategoriesIds.ONLY_IN_NOT_INITED_GUILDS,
			guilds: new Set(),
			moduleNameInBase: GuildModules.INITED_GUILD,
			targetToggleValue: false,
			dependentScope: 'initedGuilds'
		},
		guildsWithInitedTickets: {
			category: CommandsCategoriesIds.ONLY_WITH_TICKETS_INITED,
			guilds: new Set(),
			moduleNameInBase: GuildModules.TICKETS,
			targetToggleValue: true,
			dependentScope: 'guildsWithNotInitedTickets'
		},
		guildsWithNotInitedTickets: {
			category: CommandsCategoriesIds.ONLY_WITH_TICKETS_NOT_INITED,
			guilds: new Set(),
			moduleNameInBase: GuildModules.TICKETS,
			targetToggleValue: false,
			dependentScope: 'guildsWithInitedTickets'
		}
	};

	public static changeClient(client: Client): void {
		CommandsIniter._client = client;
	}

	public static async initCommands(): Promise<void> {
		await CommandsIniter._initScopes();

		CommandsIniter._changeCommands();
	
		await CommandsIniter._client.initApplicationCommands();
	}

	private static _changeCommands(): void {
		const commands = MetadataStorage.instance.applicationCommands;

		for (const command of commands as unknown as Array<DApplicationCommand & ICategory>) {
			command.dmPermission = false;

			const commandScope = CommandsIniter._getScopeForCategory(command.category as CommandsCategoriesIds | undefined);

			if (commandScope) command.guilds = CommandsIniter._getGuildsForScope(commandScope);
			else command.guilds = [process.env.TEST_GUILD_ID];

			Util.debug(`Command ${command.name} inited`);
			Util.debug(command.guilds);
		}
	}

	private static _getScopeForCategory(commandCategory?: CommandsCategoriesIds): keyof GuildsScopes | undefined {
		if (!commandCategory) return undefined;

		const guildScopesEntries = Object.entries(CommandsIniter._guildsScopes) as [keyof GuildsScopes, GuildScope][];
		const scopesFilteredByCategory = guildScopesEntries.filter(([_, { category }]) => (category === commandCategory));

		return (scopesFilteredByCategory.length <= 0 ? undefined : (CommandsIniter._guildsScopes[scopesFilteredByCategory[0][0]] ? scopesFilteredByCategory[0][0] : undefined));
	}

	private static _getGuildsForScope(scope: keyof GuildsScopes): Snowflake[] {
		const guilds = Array.from(CommandsIniter._guildsScopes[scope].guilds);

		if (
			scope === 'initedGuilds' ||
			scope === 'notInitedGuilds'
		) {
			return Array.from(new Set([process.env.TEST_GUILD_ID, ...guilds]));
		} else {
			const onlyInitedGuilds = guilds.filter((guild) => (CommandsIniter._isGuildInInitedScope(guild)));

			return Array.from(new Set([process.env.TEST_GUILD_ID, ...onlyInitedGuilds]));
		}
	}

	private static _isGuildInInitedScope(guildId: Snowflake): boolean {
		return Array.from(CommandsIniter._guildsScopes.initedGuilds.guilds).includes(guildId);
	}

	private static async _initScopes(): Promise<void> {
		const shardsGuilds = await CommandsIniter._client.shard?.fetchClientValues('guilds.cache') as Guild[][];

		for (const shardGuilds of shardsGuilds) {
			for (const { id } of shardGuilds) {
				await CommandsIniter._initScopesForGuild(id);
			}
		}
	}

	private static async _initScopesForGuild(guildId: Snowflake): Promise<void> {
		const base = new GuildsModulesBase();

		const guildModules = await base.getByGuildId(guildId);

		if (!guildModules) {
			if (!CommandsIniter._guildsScopes.notInitedGuilds.guilds.has(guildId)) CommandsIniter._guildsScopes.notInitedGuilds.guilds.add(guildId);
			if (CommandsIniter._guildsScopes.initedGuilds.guilds.has(guildId)) CommandsIniter._guildsScopes.initedGuilds.guilds.delete(guildId);
			return;
		}

		for (const module of Object.values(GuildModules)) {
			const scopes = Object.values(CommandsIniter._guildsScopes);
			const scope = scopes.filter(({ moduleNameInBase }) => (module === moduleNameInBase))[0];
			const isToggle = (guildModules[module] ?? false);

			if (!scope) continue;

			const dependentScope = (scope.dependentScope ? CommandsIniter._guildsScopes[scope.dependentScope] : null);

			if (scope.targetToggleValue === isToggle) {
				if (!scope.guilds.has(guildId)) scope.guilds.add(guildId);
				if (dependentScope?.guilds.has(guildId)) dependentScope?.guilds.delete(guildId);
			} else {
				if (!dependentScope?.guilds.has(guildId)) dependentScope?.guilds.add(guildId);
				if (scope.guilds.has(guildId)) scope.guilds.delete(guildId);
			}
		}
	}

	public static async changeCommandsForGuild(guildId: Snowflake): Promise<void> {
		await CommandsIniter._initScopesForGuild(guildId);

		CommandsIniter._changeCommands();

		await CommandsIniter._client.initApplicationCommands();
	}
}

type GuildsScopes = Record<GuildScopesKeys, GuildScope>;

type GuildScopesKeys = 'initedGuilds' | 'notInitedGuilds' | 'guildsWithInitedTickets' | 'guildsWithNotInitedTickets';

interface GuildScope {
	category: CommandsCategoriesIds;
	guilds: Set<Snowflake>;
	moduleNameInBase: GuildModules;
	targetToggleValue: boolean;
	dependentScope?: keyof GuildsScopes;
}
