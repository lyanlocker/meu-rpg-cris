import { PANACEA_ORIGINS } from "./panacea-origins";
import { PANACEA_COMBATENTE_TRAILS } from "./panacea-trails-combatente";
import { PANACEA_ESPECIALISTA_TRAILS } from "./panacea-trails-especialista";
import { PANACEA_OCULTISTA_TRAILS } from "./panacea-trails-ocultista";
import type { PanaceaClass, PanaceaOrigin, PanaceaTrail } from "./panacea-types";

export type { PanaceaClass, PanaceaOrigin, PanaceaTrail, PanaceaTrailMilestone } from "./panacea-types";
export { PANACEA_ORIGINS } from "./panacea-origins";

export const PANACEA_TRAILS: PanaceaTrail[] = [
  ...PANACEA_COMBATENTE_TRAILS,
  ...PANACEA_ESPECIALISTA_TRAILS,
  ...PANACEA_OCULTISTA_TRAILS,
];

export const PANACEA_CLASS_LABELS: Record<PanaceaClass, string> = {
  combatente: "Combatente",
  especialista: "Especialista",
  ocultista: "Ocultista",
};

export function getPanaceaOrigin(id?: string | null): PanaceaOrigin | undefined {
  return PANACEA_ORIGINS.find((origin) => origin.id === id);
}

export function getPanaceaTrail(id?: string | null): PanaceaTrail | undefined {
  return PANACEA_TRAILS.find((trail) => trail.id === id);
}

export function getPanaceaTrailsForClass(characterClass?: string | null): PanaceaTrail[] {
  return PANACEA_TRAILS.filter((trail) => trail.class === characterClass);
}
