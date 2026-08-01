import React, { useState } from "react";
import { DiceRoller } from "./DiceRoller";
import { Dice6, RadioTower, Shield, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DiceRollRecord } from "@shared/schema";

interface LocalRoll {
  rolls: number[];
  modifier: number;
  total: number;
  notation: string;
  timestamp: Date;
}

export function MasterShield() {
  const [isOpen, setIsOpen] = useState(false);
  const [localRolls, setLocalRolls] = useState<LocalRoll[]>([]);
  const [activeTab, setActiveTab] = useState<"master" | "players">("players");

  const { data: playerRolls = [] } = useQuery<DiceRollRecord[]>({
    queryKey: ["/api/dice-rolls"],
    refetchInterval: 4000,
    enabled: isOpen,
  });

  const handleLocalRoll = (roll: { rolls: number[]; modifier: number; total: number; notation: string }) => {
    setLocalRolls((previous) => [{ ...roll, timestamp: new Date() }, ...previous.slice(0, 19)]);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-none border border-primary/50 bg-background/85 text-primary hover:bg-primary hover:text-primary-foreground glow-box shadow-lg rotate-45"
        size="icon"
        data-testid="button-master-shield"
        aria-label="Abrir controle de missão"
      >
        <Shield className="w-5 h-5 -rotate-45" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[min(24rem,calc(100vw-2rem))] max-h-[650px] tech-border hud-panel bg-background/95 shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
        <div>
          <p className="section-kicker flex items-center gap-1.5"><RadioTower className="w-3 h-3" /> Panaceia // Canal de comando</p>
          <h3 className="font-bold text-primary uppercase tracking-[0.12em] text-sm glow-text mt-1">Controle de missão</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:text-primary">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex border-b border-primary/20 flex-shrink-0 bg-background/40">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${activeTab === "players" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-primary"}`}
        >
          <Users className="w-3.5 h-3.5" /> Operadores
          {playerRolls.length > 0 && <span className="data-chip py-0">{playerRolls.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("master")}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${activeTab === "master" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-primary"}`}
        >
          <Dice6 className="w-3.5 h-3.5" /> Comando
        </button>
      </div>

      {activeTab === "players" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {playerRolls.length === 0 ? (
            <div className="text-center py-10 text-primary/40 text-sm font-mono uppercase tracking-wider">
              <RadioTower className="w-8 h-8 mx-auto mb-3 opacity-30" />
              Aguardando telemetria dos operadores
            </div>
          ) : (
            playerRolls.map((roll) => (
              <div key={roll.id} className="module-card p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-primary font-bold truncate">{roll.characterName}</span>
                  <span className="text-primary/40 shrink-0">{formatTime(roll.rolledAt)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-primary/60">{roll.expression}</span>
                  <span className="text-primary/30">→</span>
                  <div className="flex gap-1 flex-wrap">
                    {(roll.results as number[]).map((result, index) => (
                      <span key={index} className="data-chip py-0.5">{result}</span>
                    ))}
                  </div>
                </div>
                <div className="text-base font-bold text-primary glow-text">Total: {roll.total}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "master" && (
        <>
          <div className="p-3 border-b border-primary/20 flex-shrink-0">
            <DiceRoller onRoll={handleLocalRoll} />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {localRolls.length === 0 ? (
              <div className="text-center py-8 text-primary/40 text-sm font-mono uppercase tracking-wider">Nenhuma simulação registrada</div>
            ) : (
              localRolls.map((roll, index) => (
                <div key={index} className="module-card p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-primary/70">{roll.notation}</span>
                    <span className="text-primary/40">{formatTime(roll.timestamp)}</span>
                  </div>
                  <div className="text-primary font-bold">Resultado: <span className="text-lg glow-text">{roll.total}</span></div>
                </div>
              ))
            )}
          </div>
          {localRolls.length > 0 && (
            <div className="p-3 border-t border-primary/20 flex-shrink-0">
              <Button onClick={() => setLocalRolls([])} variant="outline" size="sm" className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10 font-mono uppercase tracking-wider">
                <Trash2 className="w-3 h-3 mr-1" /> Limpar telemetria
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
