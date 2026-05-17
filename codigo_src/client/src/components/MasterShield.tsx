import React, { useState } from "react";
import { DiceRoller } from "./DiceRoller";
import { Shield, X, Users, Dice6, Trash2 } from "lucide-react";
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

  // Poll player rolls every 4 seconds
  const { data: playerRolls = [] } = useQuery<DiceRollRecord[]>({
    queryKey: ["/api/dice-rolls"],
    refetchInterval: 4000,
    enabled: isOpen,
  });

  const handleLocalRoll = (roll: { rolls: number[]; modifier: number; total: number; notation: string }) => {
    setLocalRolls(prev => [{ ...roll, timestamp: new Date() }, ...prev.slice(0, 19)]);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90 glow-box shadow-lg"
        size="icon"
        data-testid="button-master-shield"
      >
        <Shield className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[650px] bg-background tech-border shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <div>
          <h3 className="font-bold text-primary uppercase tracking-widest text-sm glow-text">ESCUDO DO MESTRE</h3>
          <p className="text-xs text-primary/60 font-mono mt-0.5">Monitor de Dados</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:text-primary">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/20 flex-shrink-0">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${activeTab === "players" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Users className="w-3.5 h-3.5" />
          Jogadores
          {playerRolls.length > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {playerRolls.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("master")}
          className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${activeTab === "master" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Dice6 className="w-3.5 h-3.5" />
          Mestre
        </button>
      </div>

      {/* Player rolls tab */}
      {activeTab === "players" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {playerRolls.length === 0 ? (
            <div className="text-center py-10 text-primary/40 text-sm font-mono">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Aguardando rolagens dos jogadores...
            </div>
          ) : (
            playerRolls.map((roll) => (
              <div key={roll.id} className="bg-black/40 border border-primary/20 rounded p-3 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">{roll.characterName}</span>
                  <span className="text-primary/40">{formatTime(roll.rolledAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary/60">{roll.expression}</span>
                  <span className="text-primary/30">→</span>
                  <div className="flex gap-1 flex-wrap">
                    {(roll.results as number[]).map((r, i) => (
                      <span key={i} className="bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded text-primary">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="text-base font-bold text-primary glow-text">
                  Total: {roll.total}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Master rolls tab */}
      {activeTab === "master" && (
        <>
          <div className="p-3 border-b border-primary/20 flex-shrink-0">
            <DiceRoller onRoll={handleLocalRoll} />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {localRolls.length === 0 ? (
              <div className="text-center py-8 text-primary/40 text-sm font-mono">Nenhuma rolagem ainda</div>
            ) : (
              localRolls.map((roll, idx) => (
                <div key={idx} className="bg-black/40 border border-primary/20 rounded p-2 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-primary/70">{roll.notation}</span>
                    <span className="text-primary/40">{formatTime(roll.timestamp)}</span>
                  </div>
                  <div className="text-primary font-bold">
                    Resultado: <span className="text-lg glow-text">{roll.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {localRolls.length > 0 && (
            <div className="p-3 border-t border-primary/20 flex-shrink-0">
              <Button onClick={() => setLocalRolls([])} variant="outline" size="sm" className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10">
                <Trash2 className="w-3 h-3 mr-1" /> Limpar Histórico
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
