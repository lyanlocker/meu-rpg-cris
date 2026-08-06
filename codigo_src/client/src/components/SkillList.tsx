import React, { useEffect, useRef } from "react";
import { LockKeyhole } from "lucide-react";
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
  const canEdit = typeof window === "undefined"
    || new URLSearchParams(window.location.search).get("mode") !== "player";
  const latestSkillsRef = useRef<Record<string, number>>({ ...skills });

  useEffect(() => {
    latestSkillsRef.current = {
      ...latestSkillsRef.current,
      ...skills,
    };
  }, [skills]);

  const handleSkillChange = (name: string, value: string) => {
    if (!canEdit) return;
    const numValue = parseInt(value) || 0;
    const nextSkills = {
      ...latestSkillsRef.current,
      [name]: numValue,
    };

    latestSkillsRef.current = nextSkills;
    onChange(nextSkills);
  };

  return (
    <div className="space-y-3">
      {!canEdit && (
        <div className="flex items-center gap-2 border border-primary/18 bg-background/25 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5 text-primary/55" /> Perícias definidas pelo mestre — modo somente leitura
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {SKILL_NAMES.map((skill, index) => {
          const baseVal = skills[skill] || 0;
          const maskBuff = isMaskActive && baseVal > 0 ? 5 : 0;

          return (
            <div
              key={skill}
              className={`group grid min-h-[58px] grid-cols-[1.75rem_minmax(0,1fr)_4rem] items-center gap-3 border px-3 py-2 transition-all ${canEdit ? "hover:translate-x-0.5 hover:border-primary/45 hover:bg-primary/[0.055]" : "opacity-90"} ${baseVal > 0 ? "border-primary/30 bg-primary/[0.045]" : "border-primary/15 bg-background/30"}`}
            >
              <span className="font-mono text-[9px] text-primary/45 transition-colors group-hover:text-primary/75">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-tight text-foreground/90 transition-colors group-hover:text-primary" title={skill}>
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
                disabled={!canEdit}
                onChange={(value) => handleSkillChange(skill, value)}
                aria-label={`Valor da perícia ${skill}`}
                aria-readonly={!canEdit}
                className={`h-8 w-16 shrink-0 text-center font-mono tech-input disabled:cursor-not-allowed disabled:opacity-75 ${maskBuff > 0 ? "text-red-300 glow-text" : "text-primary"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
