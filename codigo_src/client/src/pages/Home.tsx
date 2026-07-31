import React from "react";
import { Link, useLocation } from "wouter";
import { useCharacters, useCreateCharacter } from "@/hooks/use-characters";
import { MasterShield } from "@/components/MasterShield";
import { DeleteCharacterDialog } from "@/components/DeleteCharacterDialog";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Building2,
  Orbit,
  Plus,
  Radio,
  Satellite,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

export default function Home() {
  const { data: characters, isLoading } = useCharacters();
  const createMutation = useCreateCharacter();
  const [, setLocation] = useLocation();

  const handleCreate = async () => {
    try {
      const newChar = await createMutation.mutateAsync({
        name: "Operador Desconhecido",
        imageUrl: "",
        maskImageUrl: "",
        pvActual: 10,
        pvMax: 10,
        pdActual: 10,
        pdMax: 10,
        defense: 10,
        nex: 5,
        appearance: "",
        attAgi: 1, attFor: 1, attInt: 1, attPre: 1, attVig: 1,
        resistances: "",
        skills: {},
        powers: [],
        maskPowers: [],
        attacks: [],
        maskAttacks: [],
        inventory: [],
        isMaskActive: false,
        element: ""
      });
      setLocation(`/character/${newChar.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen scanlines relative z-10 px-4 py-8 md:px-10 md:py-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative">
        <header className="tech-border hud-panel mb-10 p-5 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="data-chip"><Building2 className="w-3 h-3" /> Panaceia Industries</span>
                <span className="data-chip"><Orbit className="w-3 h-3" /> Divisão Adunatio</span>
                <span className="data-chip text-emerald-300 border-emerald-400/25 bg-emerald-400/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Rede operacional
                </span>
              </div>

              <div>
                <p className="section-kicker mb-2">CRIS // Central de Registro e Inteligência de Campo</p>
                <h1 className="text-4xl md:text-6xl font-extrabold text-primary glow-text tracking-[0.08em] uppercase">
                  Deep Space
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground font-mono leading-relaxed">
                  Sistema interno de monitoramento, exposição anômala e prontuários operacionais da Panaceia Industries.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                <span className="flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-primary" /> Sinal estabilizado</span>
                <span className="flex items-center gap-2"><Satellite className="w-3.5 h-3.5 text-accent" /> Canal orbital ADU-01</span>
                <span>{characters?.length ?? 0} dossiês ativos</span>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 glow-box font-bold uppercase tracking-[0.14em] px-7 py-6 h-auto border border-primary shrink-0"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[120%] transition-transform duration-700" />
              {createMutation.isPending ? "Inicializando dossiê..." : (
                <>
                  <Plus className="mr-2 w-5 h-5" />
                  Novo Operador
                </>
              )}
            </Button>
          </div>
        </header>

        <div className="flex items-end justify-between mb-5 gap-4">
          <div>
            <p className="section-kicker">Arquivo corporativo // acesso restrito</p>
            <h2 className="section-title mt-1">Operadores designados</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="w-8 h-px bg-primary/40" /> Selecione um registro
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-72 tech-border animate-pulse" />
            ))}
          </div>
        ) : characters?.length === 0 ? (
          <div className="text-center py-24 tech-border hud-panel">
            <div className="mx-auto mb-5 w-20 h-20 border border-primary/25 bg-primary/5 grid place-items-center rotate-45">
              <User className="w-10 h-10 text-primary/45 -rotate-45" />
            </div>
            <h2 className="text-xl font-mono text-primary/75 uppercase tracking-widest">Nenhum operador localizado</h2>
            <p className="text-sm mt-2 text-muted-foreground/70">Inicialize um dossiê operacional para estabelecer o primeiro vínculo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters?.map((character, index) => (
              <div key={character.id} className="relative group">
                <Link href={`/character/${character.id}`} className="block h-full">
                  <article className="operator-card tech-border hud-panel h-full min-h-[292px] p-5 flex flex-col">
                    <div className="absolute top-0 right-0 px-3 py-1 border-l border-b border-primary/20 bg-primary/5 font-mono text-[9px] tracking-[0.18em] text-primary/55">
                      OP-{String(index + 1).padStart(3, "0")}
                    </div>
                    <div className="absolute left-0 top-16 bottom-16 w-px bg-gradient-to-b from-transparent via-primary/45 to-transparent" />

                    <div className="flex items-start gap-4 mb-5 pr-7">
                      <div className="portrait-frame w-20 h-20 overflow-hidden flex-shrink-0">
                        {character.imageUrl ? (
                          <img
                            src={character.imageUrl}
                            alt={character.name}
                            className="w-full h-full object-cover grayscale-[65%] contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-primary/35 font-mono text-2xl">∅</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-px bg-primary/60 shadow-[0_0_8px_hsl(var(--primary))] group-hover:animate-pulse" />
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Dossiê operacional</p>
                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
                          {character.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="data-chip"><Sparkles className="w-3 h-3" /> NEX {character.nex}%</span>
                          <span className="data-chip">DEF {character.defense}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="module-card p-3">
                        <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground mb-2">
                          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-red-400" /> Integridade</span>
                          <span className="text-foreground">{character.pvActual}/{character.pvMax}</span>
                        </div>
                        <div className="resource-track h-1.5">
                          <div className="h-full bg-gradient-to-r from-red-800 to-red-400 shadow-[0_0_8px_rgba(248,113,113,.45)]" style={{ width: `${Math.min(100, Math.max(0, character.pvActual / (character.pvMax || 1) * 100))}%` }} />
                        </div>
                      </div>
                      <div className="module-card p-3">
                        <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground mb-2">
                          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-cyan-300" /> Determinação</span>
                          <span className="text-foreground">{character.pdActual}/{character.pdMax}</span>
                        </div>
                        <div className="resource-track h-1.5">
                          <div className="h-full bg-gradient-to-r from-cyan-800 to-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.45)]" style={{ width: `${Math.min(100, Math.max(0, character.pdActual / (character.pdMax || 1) * 100))}%` }} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>

                <div className="absolute top-3 right-3 z-20">
                  <DeleteCharacterDialog
                    characterId={character.id}
                    characterName={character.name}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500/35 bg-background/75 text-red-400 opacity-55 hover:opacity-100 hover:bg-red-500/15"
                        aria-label={`Excluir ficha de ${character.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 pt-5 border-t border-primary/15 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/45">
          <span>Panaceia Industries // Operações Especiais</span>
          <span>Protocolo Adunatio // CRIS v.Orbit</span>
        </footer>
      </div>
      <MasterShield />
    </div>
  );
}
