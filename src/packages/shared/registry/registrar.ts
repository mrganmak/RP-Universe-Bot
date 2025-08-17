import { container } from "tsyringe";
import { BusDecoratorsMetadata, CommandHandler, CommandRegistry, ModulesBus, Guard, GuardSpec, TOKENS } from "@src/index.js";

export function registerAllHandlers() {
	const bus = container.resolve<ModulesBus>(TOKENS.Bus);

	for (const module of CommandRegistry.all()) {
		const commandName = Reflect.getMetadata(BusDecoratorsMetadata.COMMAND, module);
		if (!commandName) continue;

		const guardSpecs = (Reflect.getMetadata(BusDecoratorsMetadata.GUARDS, module) ?? []) as GuardSpec[];

		const handler = container.resolve<CommandHandler<any, any>>(module as any);

		const guards: Guard<any>[] = guardSpecs.map((spec) => {
			const guard = container.resolve<Guard<any>>(spec.use);
			if (spec.params && typeof guard.configure === "function") {
				(guard).configure(spec.params);
			}
			return guard;
		});

		bus.register(commandName, handler, guards);
	}
}
