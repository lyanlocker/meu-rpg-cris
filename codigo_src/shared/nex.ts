export const CHARACTER_CLASSES = ["combatente", "especialista", "ocultista"] as const;
export type CharacterClass = (typeof CHARACTER_CLASSES)[number];

export const NEX_STEPS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 99,
] as const;

export interface NexStatBlock {
  pv: number;
  pd: number;
}

interface ClassProgression {
  label: string;
  initial: NexStatBlock;
  perLevel: NexStatBlock;
  abilities: Record<number, string[]>;
}

export const CLASS_PROGRESSIONS: Record<CharacterClass, ClassProgression> = {
  combatente: {
    label: "Combatente",
    initial: { pv: 20, pd: 6 },
    perLevel: { pv: 4, pd: 3 },
    abilities: {
      5: ["Ataque Especial (2 PD, +5)"],
      10: ["Habilidade de trilha"],
      15: ["Poder de combatente"],
      20: ["Aumento de atributo"],
      25: ["Ataque Especial (3 PD, +10)"],
      30: ["Poder de combatente"],
      35: ["Grau de treinamento"],
      40: ["Habilidade de trilha"],
      45: ["Poder de combatente"],
      50: ["Aumento de atributo", "Versatilidade"],
      55: ["Ataque Especial (4 PD, +15)"],
      60: ["Poder de combatente"],
      65: ["Habilidade de trilha"],
      70: ["Grau de treinamento"],
      75: ["Poder de combatente"],
      80: ["Aumento de atributo"],
      85: ["Ataque Especial (5 PD, +20)"],
      90: ["Poder de combatente"],
      95: ["Aumento de atributo"],
      99: ["Habilidade de trilha"],
    },
  },
  especialista: {
    label: "Especialista",
    initial: { pv: 16, pd: 8 },
    perLevel: { pv: 3, pd: 4 },
    abilities: {
      5: ["Eclético", "Perito (2 PD, +1d6)"],
      10: ["Habilidade de trilha"],
      15: ["Poder de especialista"],
      20: ["Aumento de atributo"],
      25: ["Perito (3 PD, +1d8)"],
      30: ["Poder de especialista"],
      35: ["Grau de treinamento"],
      40: ["Engenhosidade (veterano)", "Habilidade de trilha"],
      45: ["Poder de especialista"],
      50: ["Aumento de atributo", "Versatilidade"],
      55: ["Perito (4 PD, +1d10)"],
      60: ["Poder de especialista"],
      65: ["Habilidade de trilha"],
      70: ["Grau de treinamento"],
      75: ["Engenhosidade (expert)", "Poder de especialista"],
      80: ["Aumento de atributo"],
      85: ["Perito (5 PD, +1d12)"],
      90: ["Poder de especialista"],
      95: ["Aumento de atributo"],
      99: ["Habilidade de trilha"],
    },
  },
  ocultista: {
    label: "Ocultista",
    initial: { pv: 12, pd: 10 },
    perLevel: { pv: 2, pd: 5 },
    abilities: {
      5: ["Escolhido pelo Outro Lado (1º círculo)"],
      10: ["Habilidade de trilha"],
      15: ["Poder de ocultista"],
      20: ["Aumento de atributo"],
      25: ["Escolhido pelo Outro Lado (2º círculo)"],
      30: ["Poder de ocultista"],
      35: ["Grau de treinamento"],
      40: ["Habilidade de trilha"],
      45: ["Poder de ocultista"],
      50: ["Aumento de atributo", "Versatilidade"],
      55: ["Escolhido pelo Outro Lado (3º círculo)"],
      60: ["Poder de ocultista"],
      65: ["Habilidade de trilha"],
      70: ["Grau de treinamento"],
      75: ["Poder de ocultista"],
      80: ["Aumento de atributo"],
      85: ["Escolhido pelo Outro Lado (4º círculo)"],
      90: ["Poder de ocultista"],
      95: ["Aumento de atributo"],
      99: ["Habilidade de trilha"],
    },
  },
};

export function isCharacterClass(value: unknown): value is CharacterClass {
  return typeof value === "string" && CHARACTER_CLASSES.includes(value as CharacterClass);
}

export function getNexLevel(nex: number): number {
  const index = NEX_STEPS.indexOf(nex as (typeof NEX_STEPS)[number]);
  if (index >= 0) return index + 1;
  if (nex < 5) return 0;
  return Math.min(20, Math.max(1, Math.floor(nex / 5)));
}

export function getPdLimit(nex: number): number {
  return getNexLevel(nex);
}

// Alias mantido para compatibilidade com dados e integrações antigas.
export const getPeLimit = getPdLimit;

export function getNextNex(nex: number): number | null {
  const currentIndex = NEX_STEPS.indexOf(nex as (typeof NEX_STEPS)[number]);
  if (currentIndex === -1) {
    return NEX_STEPS.find((step) => step > nex) ?? null;
  }
  return NEX_STEPS[currentIndex + 1] ?? null;
}

export function getNexAbilities(characterClass: CharacterClass, nex: number): string[] {
  return CLASS_PROGRESSIONS[characterClass].abilities[nex] ?? [];
}

export function getClassInitialStats(characterClass: CharacterClass, vigor: number, presenca: number): NexStatBlock {
  const initial = CLASS_PROGRESSIONS[characterClass].initial;
  return {
    pv: initial.pv + vigor,
    pd: initial.pd + presenca,
  };
}

export function getClassLevelGains(characterClass: CharacterClass, vigor: number, presenca: number): NexStatBlock {
  const perLevel = CLASS_PROGRESSIONS[characterClass].perLevel;
  return {
    pv: perLevel.pv + vigor,
    pd: perLevel.pd + presenca,
  };
}

export function getExpectedPdAtNex(characterClass: CharacterClass, nex: number, presenca: number): number {
  const level = Math.max(1, getNexLevel(nex));
  const initial = getClassInitialStats(characterClass, 0, presenca).pd;
  const perLevel = getClassLevelGains(characterClass, 0, presenca).pd;
  return initial + Math.max(0, level - 1) * perLevel;
}
