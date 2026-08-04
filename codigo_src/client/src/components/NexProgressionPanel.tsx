import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  Orbit,
  RadioTower,
  ScanLine,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanaceaCareerPanel } from "@/components/PanaceaCareerPanel";
import { useCharacter, useUpdateCharacter } from "@/hooks/use-characters";
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
  const updateCharacter = useUpdateCharacter();
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
        title: "FUNÇÃO OPERACIONAL ATUALIZADA",
        description: recalculateInitial
          ? `PV e PD iniciais recalculados como ${CLASS_PROGRESSIONS[newClass].label}.`
          : `Os próximos avanços usarão a tabela de ${CLASS_PROGRESSIONS[newClass].label}.`,
      });
    } catch (error) {
      toast({
        title: "Falha ao atualizar função",
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
      `Autorizar avanço de ${character.name}: NEX ${character.nex}% → ${nextNex}%?`,
      "O procedimento aumenta PV e Pontos de Determinação conforme a função operacional e os atributos atuais.",
      nextAbilities.length ? `Protocolos liberados: ${nextAbilities.join(", ")}.` : "",
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
        : "Nenhum protocolo adicional neste marco.";
      toast({
        title: `EXPOSIÇÃO NEX ${advancement.toNex}% // NÍVEL ${advancement.level}`,
        description: `+${advancement.gains.pv} PV e +${advancement.gains.pd} PD. Limite de PD ${advancement.pdLimit}. ${benefits}`,
      });
    } catch (error) {
      toast({
        title: "Falha na sincronização de NEX",
        description: error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <>
      <section className="tech-border hud-panel overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="w-full px-5 py-4 flex items-center justify-between border-b border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-left"
        >
          <span>
            <span className="section-kicker block mb-1">MOD-NEX // Telemetria anômala</span>
            <span className="flex items-center gap-2 text-primary font-mono font-bold uppercase tracking-[0.1em]">
              <Orbit className="w-4 h-4" /> Índice de exposição
            </span>
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
        </button>

        {expanded && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="module-card p-3">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">NEX</div>
                <div className="text-2xl font-bold text-primary glow-text mt-1">{character.nex}%</div>
              </div>
              <div className="module-card p-3">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Nível</div>
                <div className="text-2xl font-bold text-primary mt-1">{level}</div>
              </div>
              <div className="module-card p-3 border-cyan-400/25">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Limite PD</div>
                <div className="text-2xl font-bold text-cyan-300 mt-1">{character.peLimit}</div>
              </div>
            </div>

            <div className="module-card p-3">
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><ScanLine className="w-3 h-3 text-primary" /> Saturação paranormal</span>
                <span>{character.nex}/99</span>
              </div>
              <div className="resource-track h-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-800 via-primary to-violet-400 shadow-[0_0_12px_hsl(var(--primary)/.45)] transition-all duration-700"
                  style={{ width: `${Math.min(100, (character.nex / 99) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="section-kicker">Função operacional</label>
              {isPlayerMode ? (
                <div className="module-card px-3 py-2.5 font-mono text-sm text-foreground flex items-center justify-between">
                  <span>{classInfo.label}</span>
                  <LockKeyhole className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ) : (
                <select
                  value={characterClass}
                  disabled={isChangingClass}
                  onChange={(event) => handleClassChange(event.target.value as CharacterClass)}
                  className="w-full bg-background/75 border border-primary/35 px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {CHARACTER_CLASSES.map((value) => (
                    <option key={value} value={value}>{CLASS_PROGRESSIONS[value].label}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="module-card p-3 text-xs leading-relaxed text-cyan-100/70 flex gap-2">
              <RadioTower className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <span>PD reúne esforço e estabilidade mental. Custos de habilidades e dano mental utilizam a mesma reserva operacional.</span>
            </div>

            <div className="module-card p-3 space-y-2">
              <div className="flex items-center gap-2 text-[9px] uppercase font-mono tracking-wider text-muted-foreground">
                <Brain className="w-3.5 h-3.5 text-violet-300" /> Protocolos liberados neste NEX
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {currentAbilities.length ? currentAbilities.join(" • ") : "Nenhum protocolo específico registrado neste marco."}
              </div>
            </div>

            {!isPlayerMode && (
              <Button
                type="button"
                onClick={handleAdvanceNex}
                disabled={isAdvancing || nextNex === null}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold uppercase tracking-[0.1em] glow-box"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {nextNex === null ? "Exposição máxima registrada" : isAdvancing ? "Sincronizando exposição..." : `Autorizar NEX ${nextNex}%`}
              </Button>
            )}

            {isPlayerMode && (
              <p className="text-[9px] leading-relaxed font-mono text-muted-foreground uppercase tracking-wider flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                Progressão bloqueada no terminal do operador. Somente o controle de missão pode alterar função ou NEX.
              </p>
            )}
          </div>
        )}
      </section>

      <PanaceaCareerPanel
        originId={character.originId}
        trailId={character.trailId}
        characterClass={characterClass}
        nex={character.nex}
        onOriginChange={(originId) => updateCharacter.mutate({ id: character.id, updates: { originId } })}
        onTrailChange={(trailId) => updateCharacter.mutate({ id: character.id, updates: { trailId } })}
      />
    </>
  );
}
