import { PANACEA_RITUALS_CONHECIMENTO } from "./panacea-rituals-conhecimento";
import { PANACEA_RITUALS_ENERGIA } from "./panacea-rituals-energia";
import { PANACEA_RITUALS_SANGUE } from "./panacea-rituals-sangue";
import { PANACEA_RITUALS_MORTE } from "./panacea-rituals-morte";
import type { PanaceaRitual } from "./panacea-rituals-types";

export type { PanaceaRitual, PanaceaRitualElement } from "./panacea-rituals-types";

export const PANACEA_RITUALS: PanaceaRitual[] = [
  ...PANACEA_RITUALS_CONHECIMENTO,
  ...PANACEA_RITUALS_ENERGIA,
  ...PANACEA_RITUALS_SANGUE,
  ...PANACEA_RITUALS_MORTE,
];

export function getPanaceaRitual(id?: string | null): PanaceaRitual | undefined {
  return PANACEA_RITUALS.find((ritual) => ritual.id === id);
}
