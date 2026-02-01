import { APIEmbed } from "discord.js";
import { EmbedLocalizationIds } from "@src/index.js";

export type EmbedsLocalization = Record<EmbedLocalizationIds, EmbedLocalization>;

export interface EmbedLocalization {
	isTimestampRequired?: boolean;
	data: APIEmbed;
}
