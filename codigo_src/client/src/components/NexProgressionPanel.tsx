import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Brain, ChevronDown, ChevronUp, LockKeyhole, Minus, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MASTER_KEY_STORAGE = "ordem-master-key";

interface AdvancementResponse {
  character: unknown;
  advancement: {
    fromNex: number;
    toNex: number;
    level: number;
    peLimit: number;
    gains: { pv: number; pe: number; san: number };
    abilities: string[];
  };
}

function getStoredMasterKey(): string | null {
  return window.sessionStorage.getItem(MASTER_KEY_STORAGE);
}

function requestMasterKey(): string | null {
  const stored = getStoredMasterKey();
  if (stored) return stored;

  const entered = window.prompt("Digite o código do mestre para alterar a progressão de NEX:");
  const normalized = entered?.trim();
  if (!normalized) return null;
  window.sessionStorage.setItem(MASTER_KEY_STORAGE, normalized);
  return normalized;
}

export function NexProgressionPanel() {
  const [location] = useLocation();
  const characterId = useMemo(() => location.match(/^\/character\/([^/]+)/)?.[1] ?? "", [location]);
  const isPlayerMode = new URLSearchParams(window.location.search).get("mode") === "player";
  const { data: character } = useCharacter(characterId);
  const updateMutation = useUpdateCharacter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isChangingClass, setIsChangingClass] = useState(false);

  if (!characterId || !character) return null;

  const characterClass: CharacterClass = isCharacterClass(character.characterClass)
    ? character.characterClass
    : "combatente";
  const classInfo = CLASS_PROGRESSIONS[characterClass];
  const level = getNexLevel(character.nex);
  const nextNex = getNextNex(character.nex);
  const currentAbilities = getNexAbilities(characterClass, character.nex);

  const masterRequest = async (path: string, body: unknown): Promise<Response> => {
    const masterKey = requestMasterKey();
    if (!masterKey) throw new Error("Operação cancelada: código do mestre não informado.");

    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-master-key": masterKey,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (response.status === 403) {
      window.sessionStorage.removeItem(MASTER_KEY_STORAGE);
    }
    return response;
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
    if (newClass === characterClass) return;

    let recalculateInitial = false;
    if (character.nex === 5) {
      recalculateInitial = window.confirm(
        "Recalcular PV, PE e SAN iniciais conforme a nova classe?\n\nEscolha OK para aplicar os valores oficiais da classe ou Cancelar para manter os valores atuais."
      );
    } else if (!window.confirm("Trocar a classe altera apenas as próximas evoluções e não recalcula níveis anteriores. Continuar?")) {
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
          ? `Valores iniciais recalculados como ${CLASS_PROGRESSIONS[newClass].label}.`
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
    if (nextNex === null) return;
    const nextAbilities = getNexAbilities(characterClass, nextNex);
    const confirmation = [
      `Avançar ${character.name} de NEX ${character.nex}% para ${nextNex}%?`,
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
        description: `+${advancement.gains.pv} PV, +${advancement.gains.pe} PE, +${advancement.gains.san} SAN. Limite de PE ${advancement.peLimit}. ${benefits}`,
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

  const changeCurrentPe = (delta: number) => {
    const nextValue = Math.max(0, Math.min(character.peMax, character.peActual + delta));
    if (nextValue === character.peActual) return;
    updateMutation.mutate({ id: character.id, updates: { peActual: nextValue } });
  };

  return (
    <aside className="fixed top-20 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] tech-border bg-black/90 shadow-2xl shadow-primary/20 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full px-4 py-3 flex items-center justify-between border-b border-primary/30 bg-primary/10 text-left"
      >
        <span className="flex items-center gap-2 text-primary font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Progressão de NEX
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="border border-primary/30 bg-primary/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">NEX</div>
              <div className="text-xl font-bold text-primary">{character.nex}%</div>
            </div>
            <div className="border border-primary/30 bg-primary/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Nível</div>
              <div className="text-xl font-bold text-primary">{level}</div>
            </div>
            <div className="border border-primary/30 bg-primary/5 p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Limite PE</div>
              <div className="text-xl font-bold text-primary">{character.peLimit}</div>
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

          <div className="border border-blue-500/30 bg-blue-500/5 p-3">
            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-2 text-xs uppercase text-blue-400">
                <Activity className="w-4 h-4" /> Pontos de Esforço
              </span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => changeCurrentPe(-1)} className="h-7 w-7 border-blue-500/40 text-blue-400">
                  <Minus className="w-3 h-3" />
                </Button>
                <strong className="min-w-14 text-center text-blue-300">{character.peActual}/{character.peMax}</strong>
                <Button type="button" variant="outline" size="icon" onClick={() => changeCurrentPe(1)} className="h-7 w-7 border-blue-500/40 text-blue-400">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
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
    </aside>
  );
}
