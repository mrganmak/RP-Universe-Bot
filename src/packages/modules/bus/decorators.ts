import "reflect-metadata";
import { BotPermissionsGuard, CommandHandler, ModuleEnabledGuard, ModulesCommandsList, ModulesErrorCodes } from "@src/index.js";
import { injectable } from "tsyringe";

const META = {
	COMMAND: Symbol("CommandHandler"),
	GUARDS:  Symbol("UseGuards"),
};

export type HandlerConstructor<TIn = any, TOut = any> =
	new (...args: any[]) => CommandHandler<TIn, TOut>;

const commandRegistry = new Set<Function>();
export const CommandRegistry = {
	add: (command: Function) => commandRegistry.add(command),
	all: () => Array.from(commandRegistry),
};

export function UseModules() {
	return function (target: HandlerConstructor) {
		CommandRegistry.add(target);
	};
}

export function BusCommandName(name: keyof ModulesCommandsList) {
	return function (target: HandlerConstructor) {
		Reflect.defineMetadata(META.COMMAND, name, target);
	};
}

export function UseGuards(...guards: Array<GuardSpec | (new (...args: any[]) => any) >) {
	const incomingSpecs: GuardSpec[] = guards.map(guard =>
		typeof guard === "function" ? { use: guard } : (guard)
	);

	return function (target: HandlerConstructor) {
		const existing: GuardSpec[] = Reflect.getMetadata(META.GUARDS, target) ?? [];
		const key = (spec: GuardSpec) => `${spec.use.name}:${spec.params ? JSON.stringify(spec.params) : ""}`;
		const mergedMap = new Map(existing.map(spec => [key(spec), spec]));
		for (const spec of incomingSpecs) mergedMap.set(key(spec), spec);
		const merged = Array.from(mergedMap.values());
   
		Reflect.defineMetadata(META.GUARDS, merged, target);
	};
}

export function RequirePermissions(...required: bigint[]): (target: HandlerConstructor) => void;
export function RequirePermissions(guardFn: (input: any) => Promise<boolean>): (target: HandlerConstructor) => void;
export function RequirePermissions(...args: (bigint | ((input: any) => Promise<boolean>))[]) {
	if (args.length === 0) {
		throw new Error("RequirePermissions requires at least one argument");
	}
	
	const firstArg = args[0];
	if (typeof firstArg === "function") {
		return UseGuards({ use: FunctionalGuardWrapper, params: { guard: firstArg } });
	} else {
		const permissions = args as bigint[];
		return UseGuards({ use: BotPermissionsGuard, params: { required: permissions } });
	}
}

export type GuardSpec = { use: new (...args: any[]) => any; params?: unknown };

export const BusDecoratorsMetadata = META;

@injectable()
class FunctionalGuardWrapper<T extends { guildId: string }> {
	private guardFn: (input: T) => Promise<boolean> = async () => {
		throw new Error("Guard function is not configured");
	};

	constructor() {}
	
	async check(input: T): Promise<{ ok: boolean; value?: true; error?: string }> {
		const isAllowed = await this.guardFn(input);
		return isAllowed ? { ok: true, value: true } : { ok: false, error: ModulesErrorCodes.BotPermissionsMissing } as const;
	}
	
	configure(params: { guard: (input: T) => Promise<boolean> }): void {
		this.guardFn = params.guard;
	}
}
