import { GuildModules } from "../../enum.js";
import { TextsLocalizationsIds } from "../../localizations/index.js";

export const modulesPrivacyPolicyData: ModulesPrivacyPolicyData = {
	[GuildModules.INITED_GUILD]: {},
	[GuildModules.MARKERS]: {
		collectedData: TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_MARKERS_COLLECTED,
		sharingData: TextsLocalizationsIds.REQUEST_PRIVACY_POLICY_MARKERS_SHARING
	},
	[GuildModules.TICKETS]: {

	},
}

type ModulesPrivacyPolicyData = Record<GuildModules, ModulePrivacyPolicyData>;

interface ModulePrivacyPolicyData {
	collectedData?: TextsLocalizationsIds;
	sharingData?: TextsLocalizationsIds;
}
