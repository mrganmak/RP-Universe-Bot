import "reflect-metadata";
import { BotPermissionsGuard, CommandHandler, ModuleEnabledGuard, ModulesCommandsList } from "@src/index.js";

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

export function RegisterModule(moduleName: string) {
	return function (target: HandlerConstructor) {
		CommandRegistry.add(target);
		UseGuards({ use: ModuleEnabledGuard, params: { moduleName } })(target);
	};
}

export function BusCommandName(name: keyof ModulesCommandsList) {
	return function (target: HandlerConstructor) {
		Reflect.defineMetadata(META.COMMAND, name, target);
	};
}

export function UseGuards(...guards: Array<GuardSpec | (new (...args: any[]) => any) >) {
	console.log('guards complete')

	const incomingSpecs: GuardSpec[] = guards.map(guard =>
		typeof guard === "function" ? { use: guard } : (guard as GuardSpec)
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

export function RequirePermissions(...required: bigint[]) {
	return UseGuards({ use: BotPermissionsGuard, params: { required } });
}

export type GuardSpec = { use: new (...args: any[]) => any; params?: unknown };

export const BusDecoratorsMetadata = META;
