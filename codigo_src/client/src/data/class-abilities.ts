import type { PanaceaClass } from "./panacea-types";

export interface AutomaticAbility {
  id: string;
  name: string;
  description: string;
  source: "class";
  sourceLabel: string;
}

function getCombatantAttackSpecial(nex: number): AutomaticAbility {
  const tier = nex >= 85
    ? { cost: 5, bonus: 20 }
    : nex >= 55
      ? { cost: 4, bonus: 15 }
      : nex >= 25
        ? { cost: 3, bonus: 10 }
        : { cost: 2, bonus: 5 };

  return {
    id: "class-combatente-ataque-especial",
    name: "Ataque Especial",
    source: "class",
    sourceLabel: "Habilidade de Combatente",
    description: `Quando faz um ataque, você pode gastar 2 PD para receber +5 no teste de ataque ou na rolagem de dano. No NEX atual, pode gastar até ${tier.cost} PD para receber um total de +${tier.bonus}, distribuindo cada bônus de +5 entre ataque e dano.`,
  };
}

function getSpecialistAbilities(nex: number): AutomaticAbility[] {
  const perito = nex >= 85
    ? { cost: 5, die: "1d12" }
    : nex >= 55
      ? { cost: 4, die: "1d10" }
      : nex >= 25
        ? { cost: 3, die: "1d8" }
        : { cost: 2, die: "1d6" };

  const abilities: AutomaticAbility[] = [
    {
      id: "class-especialista-ecletico",
      name: "Eclético",
      source: "class",
      sourceLabel: "Habilidade de Especialista",
      description: "Quando faz um teste de uma perícia, você pode gastar 2 PD para receber os benefícios de ser treinado nessa perícia.",
    },
    {
      id: "class-especialista-perito",
      name: "Perito",
      source: "class",
      sourceLabel: "Habilidade de Especialista",
      description: `Escolha duas perícias nas quais seja treinado, exceto Luta e Pontaria. Quando faz um teste de uma delas, no NEX atual pode gastar ${perito.cost} PD para somar +${perito.die} ao resultado.`,
    },
  ];

  if (nex >= 40) {
    abilities.push({
      id: "class-especialista-engenhosidade",
      name: "Engenhosidade",
      source: "class",
      sourceLabel: "Habilidade de Especialista",
      description: nex >= 75
        ? "Quando usa Eclético, pode gastar 2 PD adicionais para receber os benefícios de veterano na perícia, ou 4 PD adicionais para receber os benefícios de expert."
        : "Quando usa Eclético, pode gastar 2 PD adicionais para receber os benefícios de veterano na perícia.",
    });
  }

  return abilities;
}

function getOccultistAbility(nex: number): AutomaticAbility {
  const circle = nex >= 85 ? 4 : nex >= 55 ? 3 : nex >= 25 ? 2 : 1;

  return {
    id: "class-ocultista-escolhido",
    name: "Escolhido pelo Outro Lado",
    source: "class",
    sourceLabel: "Habilidade de Ocultista",
    description: `Você pode lançar rituais de até ${circle}º círculo. Começa com três rituais de 1º círculo e, sempre que avança de NEX, aprende um ritual de qualquer círculo que já possa lançar; esses rituais não contam no limite de rituais conhecidos.`,
  };
}

export function getAutomaticClassAbilities(
  characterClass?: string | null,
  nex = 5,
): AutomaticAbility[] {
  const normalizedClass = characterClass as PanaceaClass | undefined;

  if (normalizedClass === "combatente") {
    return [getCombatantAttackSpecial(nex)];
  }
  if (normalizedClass === "especialista") {
    return getSpecialistAbilities(nex);
  }
  if (normalizedClass === "ocultista") {
    return [getOccultistAbility(nex)];
  }
  return [];
}
