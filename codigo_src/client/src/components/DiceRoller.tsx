import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dice6 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DiceRoll {
  rolls: number[];
  modifier: number;
  total: number;
  notation: string;
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
    const match = input.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!match) return null;
    return {
      diceCount: parseInt(match[1]),
      diceSize: parseInt(match[2]),
      modifier: match[3] ? parseInt(match[3]) : 0,
    };
  };

  const rollDice = async () => {
    const parsed = parseNotation(notation);
    if (!parsed) return;

    const { diceCount, diceSize, modifier } = parsed;
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceSize) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    const roll: DiceRoll = { rolls, modifier, total, notation };

    setLastRoll(roll);
    onRoll?.(roll);

    // If in player mode, log the roll to the server so GM can monitor
    if (isPlayerMode && characterId && characterName) {
      try {
        await apiRequest("POST", "/api/dice-rolls", {
          characterId,
          characterName,
          expression: notation,
          results: rolls,
          total,
        });
      } catch {
        // Silent fail — don't disrupt the player's experience
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") rollDice();
  };

  return (
    <div className="bg-black/40 tech-border p-4 space-y-3">
      <div className="flex gap-2">
        <Input
          value={notation}
          onChange={(e) => setNotation(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Ex: 3d20+5"
          className="font-mono text-sm bg-input border-primary/30 text-primary placeholder:text-primary/40"
        />
        <Button
          onClick={rollDice}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-mono"
        >
          <Dice6 className="w-4 h-4 mr-1" />
          ROLAR
        </Button>
      </div>

      {lastRoll && (
        <div className="bg-black/60 border border-primary/30 p-3 rounded text-sm font-mono space-y-2">
          <div className="text-primary/70 text-xs uppercase tracking-widest">
            {lastRoll.notation}
          </div>
          <div className="flex gap-2 flex-wrap">
            {lastRoll.rolls.map((roll, i) => (
              <span key={i} className="bg-primary/20 border border-primary/40 px-2 py-1 rounded text-primary">
                {roll}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
            {lastRoll.modifier !== 0 && (
              <>
                <span className="text-primary">{lastRoll.rolls.reduce((a, b) => a + b, 0)}</span>
                <span className="text-primary/50">{lastRoll.modifier > 0 ? "+" : ""}{lastRoll.modifier}</span>
                <span className="text-primary/50">=</span>
              </>
            )}
            <span className="text-lg font-bold text-primary glow-text">{lastRoll.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
