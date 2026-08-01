import React from "react";
import { DebouncedInput } from "./ui/debounced-input";

const SKILL_NAMES = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades",
  "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude",
  "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação",
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem",
  "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência",
  "Tática", "Tecnologia", "Vontade"
];

interface SkillListProps {
  skills: Record<string, number>;
  onChange: (skills: Record<string, number>) => void;
  isMaskActive: boolean;
}

export function SkillList({ skills, onChange, isMaskActive }: SkillListProps) {
  const handleSkillChange = (name: string, value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({ ...skills, [name]: numValue });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
      {SKILL_NAMES.map((skill, index) => {
        const baseVal = skills[skill] || 0;
        const maskBuff = isMaskActive && baseVal > 0 ? 5 : 0;

        return (
          <div key={skill} className={`skill-node group ${baseVal > 0 ? "border-primary/25 bg-primary/[0.035]" : ""}`}>
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="font-mono text-[9px] text-primary/35 group-hover:text-primary/65 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <span className="block text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">
                  {skill}
                </span>
                {baseVal > 0 && (
                  <span className="block font-mono text-[8px] uppercase tracking-[0.16em] text-primary/40">Treinamento ativo</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {maskBuff > 0 && (
                <span className="data-chip border-red-400/30 bg-red-400/5 text-red-300 glow-text">
                  Ruptura +{maskBuff}
                </span>
              )}
              <DebouncedInput
                type="number"
                min="0"
                value={baseVal}
                onChange={(value) => handleSkillChange(skill, value)}
                className={`w-14 h-8 text-center font-mono tech-input ${maskBuff > 0 ? "text-red-300 glow-text" : "text-primary"}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
