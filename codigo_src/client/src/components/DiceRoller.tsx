import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dice6, Target, Swords } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DiceRoll {
  rolls: number[];
  modifier: number;
  total: number;
  notation: string;
  type: "skill" | "damage";
}

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
  characterId?: string;
  characterName?: string;
  isPlayerMode?: boolean;
}

export function DiceRoller({ onRoll, characterId, characterName, isPlayerMode }: DiceRollerProps) {
  const [notation, setNotation] = useState("1d20");
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  const parseNotation = (input: string): { diceCount: number; diceSize: number; modifier: number } | null => {
    // Remove espaços em branco para evitar erros de digitação
    const cleanInput = input.replace(/\s+/g, '');
    const match = cleanInput.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!match) return null;
    return {
      diceCount: parseInt(match[1]),
      diceSize: parseInt(match[2]),
      modifier: match[3] ? parseInt(match[3]) : 0,
    };
  };

  const rollDice = async (type: "skill" | "damage") => {
    const parsed = parseNotation(notation);
    if (!parsed) return;

    const { diceCount, diceSize, modifier } = parsed;
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceSize) + 1);
    }

    // Lógica da Ordem Paranormal:
    // Perícia = Pega o maior dado. Dano = Soma todos os dados.
    const baseValue = type === "skill" ? Math.max(...rolls) : rolls.reduce((a, b) => a + b, 0);
    const total = baseValue + modifier;
    
    const roll: DiceRoll = { rolls, modifier, total, notation, type };

    setLastRoll(roll);
    onRoll?.(roll);

    // Se for jogador, envia para o Escudo do Mestre com uma tag avisando o tipo
    if (isPlayerMode && characterId && characterName) {
      try {
        const expressionType = type === "skill" ? " (Perícia)" : " (Dano)";
        await apiRequest("POST", "/api/dice-rolls", {
          characterId,
          characterName,
          expression: notation + expressionType,
          results: rolls,
          total,
        });
      } catch {
        // Falha silenciosa para não atrapalhar o jogador
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") rollDice("skill"); // Padrão será perícia no Enter
  };

  return (
    <div className="bg-black/40 tech-border p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={notation}
          onChange={(e) => setNotation(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Ex: 3d20+10"
          className="font-mono text-sm bg-input border-primary/30 text-primary placeholder:text-primary/40 flex-1"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => rollDice("skill")}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 font-mono flex-1 sm:flex-none"
            title="Pega o maior resultado e soma o modificador"
          >
            <Target className="w-4 h-4 mr-1" />
            PERÍCIA
          </Button>
          <Button
            onClick={() => rollDice("damage")}
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/20 px-4 font-mono flex-1 sm:flex-none"
            title="Soma todos os dados e o modificador"
          >
            <Swords className="w-4 h-4 mr-1" />
            DANO
          </Button>
        </div>
      </div>

      {lastRoll && (
        <div className="bg-black/60 border border-primary/30 p-3 rounded text-sm font-mono space-y-2">
          <div className="flex justify-between items-center text-primary/70 text-xs uppercase tracking-widest">
            <span>{lastRoll.notation}</span>
            <span className={lastRoll.type === "skill" ? "text-primary" : "text-red-400"}>
              {lastRoll.type === "skill" ? "Modo: Maior Dado" : "Modo: Soma Total"}
            </span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {lastRoll.rolls.map((roll, i) => {
              // Se for perícia, destaca o maior dado
              const isHighest = lastRoll.type === "skill" && roll === Math.max(...lastRoll.rolls);
              const highlightClass = isHighest 
                ? "bg-primary/40 border-primary text-white font-bold" 
                : lastRoll.type === "skill" 
                  ? "bg-primary/5 border-primary/20 text-primary/40" // Esmaece os menores na perícia
                  : "bg-red-500/20 border-red-500/40 text-red-400"; // Visual de dano
              
              return (
                <span key={i} className={`border px-2 py-1 rounded transition-colors ${highlightClass}`}>
                  {roll}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
            <span className="text-primary/70">
              {lastRoll.type === "skill" ? "Maior:" : "Soma:"} 
              <span className="ml-1 text-primary">
                {lastRoll.type === "skill" ? Math.max(...lastRoll.rolls) : lastRoll.rolls.reduce((a, b) => a + b, 0)}
              </span>
            </span>
            
            {lastRoll.modifier !== 0 && (
              <>
                <span className="text-primary/50">{lastRoll.modifier > 0 ? "+" : ""}{lastRoll.modifier}</span>
              </>
            )}
            
            <span className="text-primary/50">=</span>
            <span className={`text-xl font-bold glow-text ${lastRoll.type === "skill" ? "text-primary" : "text-red-500"}`}>
              {lastRoll.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
