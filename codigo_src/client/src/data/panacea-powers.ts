import type { PanaceaClass } from "./panacea-types";
import { PANACEA_COMBATENTE_POWER_DATA } from "./panacea-powers-combatente";
import { PANACEA_ESPECIALISTA_POWER_DATA } from "./panacea-powers-especialista";
import { PANACEA_OCULTISTA_POWER_DATA } from "./panacea-powers-ocultista";

export interface PanaceaPowerOption {
  id: string;
  code: string;
  name: string;
  class: PanaceaClass;
  trailId: string;
  trail: string;
  requiredNex: number;
  description: string;
}

type RawPower = readonly [
  id: string,
  code: string,
  name: string,
  trailId: string,
  trail: string,
  description: string,
];

function expand(className: PanaceaClass, entries: readonly RawPower[]): PanaceaPowerOption[] {
  return entries.map(([id, code, name, trailId, trail, description]) => ({
    id,
    code,
    name,
    class: className,
    trailId,
    trail,
    requiredNex: 15,
    description,
  }));
}

export const PANACEA_POWER_OPTIONS: PanaceaPowerOption[] = [
  ...expand("combatente", PANACEA_COMBATENTE_POWER_DATA),
  ...expand("especialista", PANACEA_ESPECIALISTA_POWER_DATA),
  ...expand("ocultista", PANACEA_OCULTISTA_POWER_DATA),
];

export function getPanaceaPowersForTrail(trailId?: string | null): PanaceaPowerOption[] {
  if (!trailId) return [];
  return PANACEA_POWER_OPTIONS.filter((power) => power.trailId === trailId);
}

export function getPanaceaPower(id?: string | null): PanaceaPowerOption | undefined {
  return PANACEA_POWER_OPTIONS.find((power) => power.id === id);
}
