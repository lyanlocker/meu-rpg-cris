import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Crosshair,
  Dna,
  Droplets,
  Gauge,
  Link as LinkIcon,
  Orbit,
  Radio,
  Shield,
  Skull,
  Trash2,
  Zap,
} from "lucide-react";
import { useCharacter, useUpdateCharacter } from "@/hooks/use-characters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DeleteCharacterDialog } from "@/components/DeleteCharacterDialog";
import { NexProgressionPanel } from "@/components/NexProgressionPanel";
import { ElementEffect } from "@/components/ElementEffect";
import { SkillList } from "@/components/SkillList";
import { PowersSection } from "@/components/PowersSection";
import { AttacksSection } from "@/components/AttacksSection";
import { InventorySection } from "@/components/InventorySection";
import { DiceRoller } from "@/components/DiceRoller";
import { MasterShield } from "@/components/MasterShield";

const ELEMENTS = [
  { id: "sangue", label: "Sangue", icon: Droplets, color: "text-red-400 border-red-500/45 hover:bg-red-500/15" },
  { id: "morte", label: "Morte", icon: Skull, color: "text-emerald-500 border-emerald-600/45 hover:bg-emerald-700/15" },
  { id: "conhecimento", label: "Conhecimento", icon: BookOpen, color: "text-violet-300 border-violet-400/45 hover:bg-violet-400/15" },
  { id: "energia", label: "Energia", icon: Zap, color: "text-purple-300 border-purple-400/45 hover:bg-purple-400/15" },
] as const;

function ModuleHeader({ code, title, icon, description }: {
  code: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-primary/20 pb-3 mb-5">
      <div>
        <p className="section-kicker">{code}</p>
        <h2 className="section-title mt-1 flex items-center gap-2">{icon}{title}</h2>
      </div>
      {description && <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/65 max-w-sm sm:text-right">{description}</p>}
    </div>
  );
}

function ResourceBar({ label, code, color, value, max, onValue, onMax }: {
  label: string;
  code: string;
  color: "red" | "cyan";
  value: number;
  max: number;
  onValue: (value: number) => void;
  onMax: (value: number) => void;
}) {
  const tone = color === "red"
    ? { text: "text-red-400", fill: "from-red-900 via-red-600 to-red-300", glow: "shadow-[0_0_10px_rgba(248,113,113,.45)]" }
    : { text: "text-cyan-300", fill: "from-cyan-900 via-cyan-600 to-cyan-200", glow: "shadow-[0_0_10px_rgba(103,232,249,.45)]" };

  return (
    <div className="module-card p-3 space-y-2">
      <div className="flex justify-between items-end gap-3 font-mono uppercase">
        <div>
          <div className="text-[9px] tracking-[0.18em] text-muted-foreground/55">{code}</div>
          <span className={`text-[11px] font-bold ${tone.text}`}>{label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <DebouncedInput type="number" value={value} onChange={(input) => onValue(parseInt(input) || 0)} className="tech-input w-12 text-right p-0 text-foreground" />
          <span className="text-muted-foreground">/</span>
          <DebouncedInput type="number" value={max} onChange={(input) => onMax(parseInt(input) || 0)} className="tech-input w-10 p-0 text-muted-foreground" />
        </div>
      </div>
      <div className="resource-track">
        <div
          className={`h-full bg-gradient-to-r ${tone.fill} ${tone.glow} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value / (max || 1) * 100))}%` }}
        />
      </div>
    </div>
  );
}

export default function Sheet() {
  const { id } = useParams();
  const { data: character, isLoading, error } = useCharacter(id || "");
  const updateMutation = useUpdateCharacter();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const isPlayerMode = new URLSearchParams(window.location.search).get("mode") === "player";
  const [localChar, setLocalChar] = useState(character);
  const [baseStats, setBaseStats] = useState<any>({});

  useEffect(() => {
    if (!character) return;
    setLocalChar(character);
    if (!character.isMaskActive) {
      setBaseStats({
        pvMax: character.pvMax,
        pvActual: character.pvActual,
        pdMax: character.pdMax,
        pdActual: character.pdActual,
        defense: character.defense,
      });
    }
  }, [character]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative z-10 grid place-items-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border border-primary/25 border-t-primary rotate-45 animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary mt-6">Sincronizando dossiê orbital</p>
        </div>
      </div>
    );
  }

  if (error || !localChar) {
    return <div className="min-h-screen relative z-10 text-primary grid place-items-center font-mono uppercase tracking-wider">Dossiê indisponível ou registro não encontrado.</div>;
  }

  const isMaskActive = localChar.isMaskActive;
  const isMaster = !isPlayerMode;
  const currentElement = (localChar.element || "") as "sangue" | "morte" | "conhecimento" | "energia" | "";

  const update = (field: string, value: any) => {
    setLocalChar({ ...localChar, [field]: value });
    updateMutation.mutate({ id: localChar.id, updates: { [field]: value } });
  };

  const updateMany = (updates: any) => {
    setLocalChar({ ...localChar, ...updates });
    updateMutation.mutate({ id: localChar.id, updates });
  };

  const toggleMask = () => {
    if (!isMaskActive) {
      updateMany({
        isMaskActive: true,
        pvMax: (baseStats.pvMax ?? localChar.pvMax) + 20,
        pvActual: (baseStats.pvActual ?? localChar.pvActual) + 20,
        pdMax: (baseStats.pdMax ?? localChar.pdMax) + 10,
        pdActual: (baseStats.pdActual ?? localChar.pdActual) + 10,
        defense: (baseStats.defense ?? localChar.defense) + 10,
      });
      toast({ title: "PROTOCOLO DE RUPTURA ATIVO", description: "Máscara sincronizada. Parâmetros de alto risco liberados.", variant: "destructive" });
    } else {
      updateMany({
        isMaskActive: false,
        pvMax: Math.max(0, localChar.pvMax - 20),
        pvActual: Math.max(0, localChar.pvActual - 20),
        pdMax: Math.max(0, localChar.pdMax - 10),
        pdActual: Math.max(0, localChar.pdActual - 10),
        defense: Math.max(0, localChar.defense - 10),
      });
      toast({ title: "PROTOCOLO NORMALIZADO", description: "Parâmetros biométricos retornaram à configuração basal." });
    }
  };

  const activeImage = isMaskActive && localChar.maskImageUrl ? localChar.maskImageUrl : localChar.imageUrl;
  const reflexos = (localChar.skills as Record<string, number>)?.Reflexos || 0;
  const attributes = [
    ["AGI", "attAgi", "MOB"],
    ["FOR", "attFor", "POT"],
    ["INT", "attInt", "COG"],
    ["PRE", "attPre", "PSI"],
    ["VIG", "attVig", "BIO"],
  ] as const;

  return (
    <div className={`min-h-screen scanlines relative z-10 transition-colors duration-1000 ${isMaskActive ? "mask-mode" : ""}`}>
      <ElementEffect element={currentElement} maskActive={isMaskActive} />

      <header className="orbital-topbar sticky top-0 z-40 px-3 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {!isPlayerMode && (
              <Link href="/" className="text-muted-foreground hover:text-primary flex items-center gap-2 font-mono text-xs uppercase shrink-0">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Central</span>
              </Link>
            )}
            <span className="hidden sm:block w-px h-6 bg-primary/20" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.18em]">
                <Orbit className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Panaceia Industries // Operações Especiais</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/55 mt-0.5">
                <Radio className="w-3 h-3 text-emerald-300" /> Canal seguro // Dossiê {localChar.id.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Canal copiado", description: "O endereço seguro do operador foi copiado." });
              }}
              className="border-primary/40 bg-background/50 text-primary font-mono"
            >
              <LinkIcon className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            {isMaster && (
              <DeleteCharacterDialog
                characterId={localChar.id}
                characterName={localChar.name}
                onDeleted={() => setLocation("/")}
                trigger={
                  <Button variant="outline" size="sm" className="border-red-500/40 bg-background/50 text-red-400 font-mono">
                    <Trash2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Expurgar</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-7 relative">
        <aside className="lg:col-span-4 space-y-6">
          <section className="tech-border hud-panel p-3">
            <div className="flex items-center justify-between gap-3 px-1 pb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex items-center gap-2"><Dna className="w-3.5 h-3.5 text-primary" /> Registro biométrico</span>
              <span className={`flex items-center gap-1.5 ${isMaskActive ? "text-red-400" : "text-emerald-300"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMaskActive ? "bg-red-400 animate-pulse" : "bg-emerald-300"}`} />
                {isMaskActive ? "Ruptura" : "Estável"}
              </span>
            </div>

            <div
              className={`portrait-frame relative aspect-[3/4] overflow-hidden cursor-pointer group ${isMaskActive ? "glow-box border-red-500/70" : ""}`}
              onDoubleClick={toggleMask}
              title="Duplo clique para ativar/desativar o Protocolo de Ruptura"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={localChar.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${isMaskActive ? "contrast-125 saturate-125" : "grayscale-[45%] group-hover:grayscale-0 group-hover:scale-[1.02]"}`}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center font-mono text-muted-foreground/30 text-xl uppercase text-center px-8">
                  Sinal biométrico sem imagem
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_49%,hsl(var(--primary)/.07)_50%,transparent_51%)] bg-[length:8px_100%] opacity-50" />
              <div className="absolute left-0 right-0 h-px bg-primary/70 shadow-[0_0_10px_hsl(var(--primary))] opacity-0 group-hover:opacity-70 group-hover:animate-[resource-scan_3s_ease-in-out_infinite]" />
              {isMaskActive && <div className="absolute inset-0 border-2 border-red-500/70 animate-pulse pointer-events-none mix-blend-screen" />}
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="section-kicker">Fonte visual // {isMaskActive ? "Máscara" : "Operador"}</label>
                <DebouncedInput
                  value={isMaskActive ? localChar.maskImageUrl || "" : localChar.imageUrl}
                  onChange={(value) => update(isMaskActive ? "maskImageUrl" : "imageUrl", value)}
                  className="tech-input text-xs mt-1"
                  placeholder="https://..."
                />
              </div>

              {isMaster && (
                <div>
                  <p className="section-kicker mb-2">Assinatura paranormal</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ELEMENTS.map(({ id: element, label, icon: Icon, color }) => (
                      <button
                        key={element}
                        onClick={() => update("element", currentElement === element ? "" : element)}
                        className={`flex items-center gap-1.5 px-2 py-2 text-[10px] uppercase tracking-wider font-mono border transition-all ${color} ${currentElement === element ? "opacity-100 ring-1 ring-current bg-white/5" : "opacity-48"}`}
                      >
                        <Icon className="w-3 h-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <NexProgressionPanel characterId={localChar.id} isPlayerMode={isPlayerMode} />

          <section className="tech-border hud-panel p-5 space-y-4">
            <div>
              <p className="section-kicker">Identificação interna</p>
              <label className="text-xs font-mono text-primary/75 uppercase">Operador designado</label>
              <DebouncedInput value={localChar.name} onChange={(value) => update("name", value)} className="tech-input text-2xl font-bold uppercase mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="module-card p-3">
                <span className="section-kicker">EVA // Reflexo</span>
                <div className="text-2xl font-bold text-primary mt-1 flex items-center gap-2"><Gauge className="w-5 h-5" />{reflexos + localChar.defense}</div>
              </div>
              <div className="module-card p-3">
                <span className="section-kicker">DEF // Blindagem</span>
                <DebouncedInput type="number" value={localChar.defense} onChange={(value) => update("defense", parseInt(value) || 0)} className="tech-input w-16 text-xl text-center mt-1" />
              </div>
            </div>

            <ResourceBar label="Pontos de Vida" code="BIO // Integridade" color="red" value={localChar.pvActual} max={localChar.pvMax} onValue={(value) => update("pvActual", value)} onMax={(value) => update("pvMax", value)} />
            <ResourceBar label="Pontos de Determinação" code="PSI // Reserva" color="cyan" value={localChar.pdActual} max={localChar.pdMax} onValue={(value) => update("pdActual", value)} onMax={(value) => update("pdMax", value)} />

            <div>
              <label className="section-kicker">Tolerâncias e resistências</label>
              <DebouncedInput multiline value={localChar.resistances ?? ""} onChange={(value) => update("resistances", value)} className="bg-background/45 border-primary/20 font-mono text-sm min-h-[72px] mt-1" placeholder="Contenções, imunidades e tolerâncias registradas..." />
            </div>
            <div>
              <label className="section-kicker">Registro biométrico e observações</label>
              <DebouncedInput multiline value={localChar.appearance} onChange={(value) => update("appearance", value)} className="bg-background/45 border-primary/20 font-mono text-sm min-h-[120px] mt-1" placeholder="Descrição física, alterações, cicatrizes e anomalias..." />
            </div>
          </section>
        </aside>

        <main className="lg:col-span-8 space-y-7">
          <section className="tech-border hud-panel p-5 md:p-6">
            <ModuleHeader code="MOD-01 // Leitura biométrica" title="Matriz de atributos" icon={<Dna className="w-5 h-5" />} description="Parâmetros fundamentais do operador em tempo real" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {attributes.map(([label, field, code]) => (
                <div key={field} className="attribute-node p-3">
                  <span className="section-kicker">{code}</span>
                  <span className="font-mono text-xs font-bold text-primary mb-1 tracking-[0.2em]">{label}</span>
                  <DebouncedInput
                    type="number"
                    value={localChar[field]}
                    onChange={(value) => update(field, parseInt(value) || 0)}
                    className="relative z-10 w-16 h-14 border border-primary/35 bg-background/65 text-center text-2xl font-bold text-primary focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="tech-border hud-panel p-5 md:p-6">
            <ModuleHeader code="MOD-02 // Perfil operacional" title="Perícias" icon={<Activity className="w-5 h-5" />} description="Treinamentos, competências e valores de perícia do operador" />
            <SkillList skills={localChar.skills as Record<string, number>} onChange={(value) => update("skills", value)} isMaskActive={isMaskActive} />
          </section>

          <section className="tech-border hud-panel p-5 md:p-6">
            <PowersSection
              powers={((isMaskActive ? localChar.maskPowers : localChar.powers) as any) || []}
              onChange={(value) => update(isMaskActive ? "maskPowers" : "powers", value)}
              type={isMaskActive ? "mask" : "normal"}
            />
          </section>

          <section className="tech-border hud-panel p-5 md:p-6">
            <AttacksSection
              attacks={((isMaskActive ? localChar.maskAttacks : localChar.attacks) as any) || []}
              onChange={(value) => update(isMaskActive ? "maskAttacks" : "attacks", value)}
              type={isMaskActive ? "mask" : "normal"}
            />
          </section>

          <section className="tech-border hud-panel p-5 md:p-6">
            <InventorySection inventory={(localChar.inventory as any) || []} onChange={(value) => update("inventory", value)} />
          </section>

          <section className="tech-border hud-panel p-5 md:p-6">
            <ModuleHeader code="MOD-06 // Simulação tática" title="Terminal de dados" icon={<Crosshair className="w-5 h-5" />} description="Rolagens transmitidas ao escudo de controle" />
            <DiceRoller characterId={localChar.id} characterName={localChar.name} isPlayerMode={isPlayerMode} />
          </section>
        </main>
      </div>

      <footer className="max-w-7xl mx-auto px-4 md:px-8 pb-8 pt-2 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/45">
        <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Panaceia Industries // Dossiê confidencial</span>
        <span>Operações Deep Space // Link {localChar.id.toUpperCase()}</span>
      </footer>

      {isMaster && <MasterShield />}
    </div>
  );
}
