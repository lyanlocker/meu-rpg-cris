export type PanaceaClass = "combatente" | "especialista" | "ocultista";

export interface PanaceaOrigin {
  id: string;
  name: string;
  description: string;
  trainedSkills: string[];
  abilityName: string;
  abilityDescription: string;
  affinity: PanaceaClass[];
}

export interface PanaceaTrailMilestone {
  nex: number;
  name: string;
  description: string;
}

export interface PanaceaTrail {
  id: string;
  name: string;
  class: PanaceaClass;
  description: string;
  milestones: PanaceaTrailMilestone[];
}
