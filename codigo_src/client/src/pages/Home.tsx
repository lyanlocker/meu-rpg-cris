import React from "react";
import { Link, useLocation } from "wouter";
import { useCharacters, useCreateCharacter } from "@/hooks/use-characters";
import { MasterShield } from "@/components/MasterShield";
import { Button } from "@/components/ui/button";
import { Plus, User, Shield, Activity } from "lucide-react";

export default function Home() {
  const { data: characters, isLoading } = useCharacters();
  const createMutation = useCreateCharacter();
  const [, setLocation] = useLocation();

  const handleCreate = async () => {
    try {
      const newChar = await createMutation.mutateAsync({
        name: "Agente Desconhecido",
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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background scanlines relative p-6 md:p-12 overflow-hidden">
      
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-primary/20 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary glow-text tracking-widest uppercase">
              Ordem Paranormal
            </h1>
            <p className="text-muted-foreground font-mono mt-2 tracking-widest text-sm">
              SISTEMA DE ARQUIVOS DA ORDEM // ACESSO RESTRITO
            </p>
          </div>
          <Button 
            onClick={handleCreate} 
            disabled={createMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-box font-bold uppercase tracking-wider px-8 py-6 h-auto border border-primary"
          >
            {createMutation.isPending ? "Inicializando..." : (
              <>
                <Plus className="mr-2 w-5 h-5" />
                Novo Agente
              </>
            )}
          </Button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 tech-border animate-pulse bg-card/50" />
            ))}
          </div>
        ) : characters?.length === 0 ? (
          <div className="text-center py-24 tech-border bg-black/40">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest">Nenhum registro encontrado</h2>
            <p className="text-sm mt-2 text-muted-foreground/60">Inicie um novo arquivo de agente para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters?.map(char => (
              <Link key={char.id} href={`/character/${char.id}`} className="block group">
                <div className="tech-border h-full bg-black/60 hover:bg-primary/5 transition-all duration-300 p-6 flex flex-col relative overflow-hidden group-hover:-translate-y-1">
                  
                  {/* Hover glow line */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded overflow-hidden bg-secondary border border-primary/30 flex-shrink-0">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30 font-mono text-2xl">?</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{char.name}</h3>
                      <span className="text-xs font-mono text-primary/70 bg-primary/10 px-2 py-0.5 mt-1 inline-block border border-primary/20">
                        DEF {char.defense}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-red-500" /> PV</span>
                        <span>{char.pvActual}/{char.pvMax}</span>
                      </div>
                      <div className="h-1 bg-secondary w-full rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${Math.min(100, Math.max(0, (char.pvActual / char.pvMax) * 100))}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-500" /> PD</span>
                        <span>{char.pdActual}/{char.pdMax}</span>
                      </div>
                      <div className="h-1 bg-secondary w-full rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, (char.pdActual / char.pdMax) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <MasterShield />
    </div>
  );
}
