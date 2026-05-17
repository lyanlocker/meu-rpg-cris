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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {SKILL_NAMES.map(skill => {
        const baseVal = skills[skill] || 0;
        const maskBuff = (isMaskActive && baseVal > 0) ? 5 : 0;
        const totalVal = baseVal + maskBuff;

        return (
          <div key={skill} className="flex items-center justify-between group hover:bg-white/5 p-1 -mx-1 rounded transition-colors">
            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors cursor-default">
              {skill}
            </span>
            <div className="flex items-center gap-2">
              {maskBuff > 0 && (
                <span className="text-xs font-mono text-primary font-bold glow-text">
                  +{maskBuff}
                </span>
              )}
              <DebouncedInput
                type="number"
                min="0"
                value={baseVal}
                onChange={(val) => handleSkillChange(skill, val)}
                className={`w-14 h-7 text-right font-mono tech-input ${maskBuff > 0 ? 'text-primary glow-text' : ''}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
