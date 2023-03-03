import { TTextsLocalization } from "../types/TextsLocalizationsTypes.js";
import EDefaultTextLocalization from "./default.js";

const enTextsLocaliztion: TTextsLocalization = Object.fromEntries(Object.values(EDefaultTextLocalization).map((value) => ([ value, value ]))) as unknown as TTextsLocalization;

export default enTextsLocaliztion;
