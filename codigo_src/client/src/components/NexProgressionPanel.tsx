import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, ChevronDown, ChevronUp, LockKeyhole, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/hooks/use-characters";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import {
  CHARACTER_CLASSES,
  CLASS_PROGRESSIONS,
  getNexAbilities,
  getNexLevel,
  getNextNex,
  isCharacterClass,
  type CharacterClass,
} from "@shared/nex";

interface NexProgressionPanelProps {
  characterId: string;
  isPlayerMode: boolean;
}

interface AdvancementResponse {
  character: unknown;
  advancement: {
    fromNex: number;
    toNex: number;
    level: number;
    pdLimit: number;
    gains: { pv: number; pd: number };
    abilities: string[];
  };
}

export function NexProgressionPanel({ characterId, isPlayerMode }: NexProgressionPanelProps) {
  const { data: character } = useCharacter(characterId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isChangingClass, setIsChangingClass] = useState(false);

  if (!character) return null;

  const characterClass: CharacterClass = isCharacterClass(character.characterClass)
    ? character.characterClass
    : "combatente";
  const classInfo = CLASS_PROGRESSIONS[characterClass];
  const level = getNexLevel(character.nex);
  const nextNex = getNextNex(character.nex);
  const currentAbilities = getNexAbilities(characterClass, character.nex);

  const masterRequest = async (path: string, body: unknown): Promise<Response> => {
    if (isPlayerMode) {
      throw new Error("O modo jogador não pode alterar a progressão de NEX.");
    }

    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  };

  const refreshCharacter = async () => {
    await queryClient.invalidateQueries({ queryKey: [api.characters.get.path, character.id] });
    await queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
  };

  const readError = async (response: Response): Promise<string> => {
    try {
      const payload = await response.json();
      return payload.message || "Não foi possível concluir a operação.";
    } catch {
      return "Não foi possível concluir a operação.";
    }
  };

  const handleClassChange = async (newClass: CharacterClass) => {
    if (newClass === characterClass || isPlayerMode) return;

    let recalculateInitial = false;
    if (character.nex === 5) {
      recalculateInitial = window.confirm(
        "Recalcular PV e PD iniciais conforme a nova classe?\n\nOK aplica os valores de Jogando sem Sanidade. Cancelar mantém os valores personalizados atuais."
      );
    } else if (!window.confirm("Trocar a classe altera apenas os próximos avanços e não recalcula NEX anteriores. Continuar?")) {
      return;
    }

    setIsChangingClass(true);
    try {
      const response = await masterRequest(`/api/characters/${character.id}/class`, {
        characterClass: newClass,
        recalculateInitial,
      });
      if (!response.ok) throw new Error(await readError(response));
      await refreshCharacter();
      toast({
        title: "Classe de progressão atualizada",
        description: recalculateInitial
          ? `PV e PD iniciais recalculados como ${CLASS_PROGRESSIONS[newClass].label}.`
          : `Os próximos avanços usarão a tabela de ${CLASS_PROGRESSIONS[newClass].label}.`,
      });
    } catch (error) {
      toast({
        title: "Não foi possível alterar a classe",
        description: error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsChangingClass(false);
    }
  };

  const handleAdvanceNex = async () => {
    if (nextNex === null || isPlayerMode) return;
    const nextAbilities = getNexAbilities(characterClass, nextNex);
    const confirmation = [
      `Avançar ${character.name} de NEX ${character.nex}% para ${nextNex}%?`,
      "O avanço aumenta PV e Pontos de Determinação conforme a classe e os atributos atuais.",
      nextAbilities.length ? `Benefícios: ${nextAbilities.join(", ")}.` : "",
    ].filter(Boolean).join("\n\n");
    if (!window.confirm(confirmation)) return;

    setIsAdvancing(true);
    try {
      const response = await masterRequest(`/api/characters/${character.id}/advance-nex`, {});
      if (!response.ok) throw new Error(await readError(response));
      const payload = await response.json() as AdvancementResponse;
      await refreshCharacter();

      const { advancement } = payload;
      const benefits = advancement.abilities.length
        ? advancement.abilities.join(" • ")
        : "Nenhuma habilidade adicional neste marco.";
      toast({
        title: `NEX ${advancement.toNex}% — nível ${advancement.level}`,
        description: `+${advancement.gains.pv} PV e +${advancement.gains.pd} PD. Limite de PD ${advancement.pdLimit}. ${benefits}`,
      });
    } catch (error) {
      toast({
        title: "Falha ao avançar NEX",
        description: error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <section className="tech-border bg-black/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full px-5 py-4 flex items-center justify-between border-b border-primary/30 bg-primary/10 text-left"
      >
        <span className="flex items-center gap-2 text-primary font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Progressão de NEX
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="border border-primary/30 bg-primary/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">NEX</div>
              <div className="text-xl font-bold text-primary">{character.nex}%</div>
            </div>
            <div className="border border-primary/30 bg-primary/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Nível</div>
              <div className="text-xl font-bold text-primary">{level}</div>
            </div>
            <div className="border border-blue-500/30 bg-blue-500/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Limite PD</div>
              <div className="text-xl font-bold text-blue-400">{character.peLimit}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase mb-1">
              <span>Exposição paranormal</span>
              <span>{character.nex}/99</span>
            </div>
            <div className="h-2 border border-primary/30 bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (character.nex / 99) * 100)}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Classe</label>
            {isPlayerMode ? (
              <div className="border border-primary/30 px-3 py-2 font-mono text-sm text-foreground flex items-center justify-between">
                <span>{classInfo.label}</span>
                <LockKeyhole className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            ) : (
              <select
                value={characterClass}
                disabled={isChangingClass}
                onChange={(event) => handleClassChange(event.target.value as CharacterClass)}
                className="w-full bg-black border border-primary/40 px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {CHARACTER_CLASSES.map((value) => (
                  <option key={value} value={value}>{CLASS_PROGRESSIONS[value].label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="border border-blue-500/25 bg-blue-500/5 p-3 text-xs leading-relaxed text-blue-200/80">
            Nesta ficha, PD reúne esforço e sanidade. Habilidades e dano mental usam a mesma reserva de Pontos de Determinação.
          </div>

          <div className="border border-primary/20 p-3 space-y-1">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-muted-foreground">
              <Brain className="w-3.5 h-3.5" /> Benefícios deste NEX
            </div>
            <div className="text-sm text-foreground/80">
              {currentAbilities.length ? currentAbilities.join(" • ") : "Nenhum benefício específico registrado neste marco."}
            </div>
          </div>

          {!isPlayerMode && (
            <Button
              type="button"
              onClick={handleAdvanceNex}
              disabled={isAdvancing || nextNex === null}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold uppercase tracking-wider"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {nextNex === null ? "NEX máximo atingido" : isAdvancing ? "Aplicando progressão..." : `Avançar para NEX ${nextNex}%`}
            </Button>
          )}

          {isPlayerMode && (
            <p className="text-[10px] leading-relaxed font-mono text-muted-foreground uppercase flex items-start gap-2">
              <LockKeyhole className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Somente o mestre pode alterar a classe ou avançar o NEX.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
