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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
      {SKILL_NAMES.map((skill, index) => {
        const baseVal = skills[skill] || 0;
        const maskBuff = isMaskActive && baseVal > 0 ? 5 : 0;

        return (
          <div
            key={skill}
            className={`group grid min-h-[58px] grid-cols-[1.75rem_minmax(0,1fr)_4rem] items-center gap-3 border px-3 py-2 transition-all hover:translate-x-0.5 hover:border-primary/45 hover:bg-primary/[0.055] ${baseVal > 0 ? "border-primary/30 bg-primary/[0.045]" : "border-primary/15 bg-background/30"}`}
          >
            <span className="font-mono text-[9px] text-primary/45 group-hover:text-primary/75 transition-colors">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <span
                className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors"
                title={skill}
              >
                {skill}
              </span>
              {baseVal > 0 && (
                <span className="mt-1 block whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.14em] text-primary/55">
                  Treinamento ativo{maskBuff > 0 ? ` // Ruptura +${maskBuff}` : ""}
                </span>
              )}
            </div>

            <DebouncedInput
              type="number"
              min="0"
              value={baseVal}
              onChange={(value) => handleSkillChange(skill, value)}
              aria-label={`Valor da perícia ${skill}`}
              className={`h-8 w-16 shrink-0 text-center font-mono tech-input ${maskBuff > 0 ? "text-red-300 glow-text" : "text-primary"}`}
            />
          </div>
        );
      })}
    </div>
  );
}
