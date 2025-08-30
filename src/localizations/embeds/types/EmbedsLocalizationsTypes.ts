import { APIEmbed } from "discord.js";
import { EmbedsLocalizationsIds } from "../../../index.js";

export type EmbedsLocalization = Record<EmbedsLocalizationsIds, EmbedLocalization>;

export interface EmbedLocalization {
	isTimestampRequired?: boolean;
	data: APIEmbed;
}
