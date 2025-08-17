import { ModulesCommandsList } from "@src/index.js";
import { singleton } from "tsyringe";

export type Result<T, E = string> =
	| { ok: true; value: T }
	| { ok: false; error: E };

export interface CommandHandler<In, Out> {
	execute(input: In): Promise<Result<Out>>;
}

export interface Guard<In> {
	check(input: In): Promise<Result<true>>;
	configure?(...args: any): void;
}

type Entry = { handler: CommandHandler<any, any>; guards: Guard<any>[] };

@singleton()
export class ModuleCommandsBus {
	private map = new Map<string, Entry>();

	register<In, Out>(name: string, handler: CommandHandler<In, Out>, guards: Guard<In>[] = []) {
		this.map.set(name, { handler, guards });
	}

	async execute<
		Name extends keyof ModulesCommandsList,
		In extends ModulesCommandsList[Name]['In'],
		Out extends ModulesCommandsList[Name]['Out'],
	>(name: Name, input: In): Promise<Result<Out>> {
		const entries = this.map.get(name);
		if (!entries) return { ok: false, error: "NO_HANDLER" } as any;

		for (const guard of entries.guards) {
			const result = await guard.check(input);
			if (!result.ok) return result;
		}
		return entries.handler.execute(input);
	}
}
