import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, BookOpen, Droplets, Link as LinkIcon, Skull, Trash2, Zap } from "lucide-react";
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
  { id: "sangue", label: "Sangue", icon: Droplets, color: "text-red-500 border-red-500/60 hover:bg-red-500/20" },
  { id: "morte", label: "Morte", icon: Skull, color: "text-green-700 border-green-700/60 hover:bg-green-700/20" },
  { id: "conhecimento", label: "Conhecimento", icon: BookOpen, color: "text-violet-400 border-violet-400/60 hover:bg-violet-400/20" },
  { id: "energia", label: "Energia", icon: Zap, color: "text-purple-400 border-purple-400/60 hover:bg-purple-400/20" },
] as const;

function ResourceBar({ label, color, value, max, onValue, onMax }: {
  label: string; color: "red" | "blue"; value: number; max: number;
  onValue: (value: number) => void; onMax: (value: number) => void;
}) {
  const tone = color === "red"
    ? { text: "text-red-500", border: "border-red-900/30", fill: "bg-red-600" }
    : { text: "text-blue-500", border: "border-blue-900/30", fill: "bg-blue-600" };
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end text-xs font-mono font-bold uppercase">
        <span className={tone.text}>{label}</span>
        <div className="flex items-center gap-1">
          <DebouncedInput type="number" value={value} onChange={(v) => onValue(parseInt(v) || 0)} className="tech-input w-12 text-right p-0 text-foreground" />
          <span className="text-muted-foreground">/</span>
          <DebouncedInput type="number" value={max} onChange={(v) => onMax(parseInt(v) || 0)} className="tech-input w-10 p-0 text-muted-foreground" />
        </div>
      </div>
      <div className={`h-4 bg-secondary w-full relative overflow-hidden border ${tone.border}`}>
        <div className={`absolute inset-y-0 left-0 ${tone.fill} transition-all`} style={{ width: `${Math.min(100, Math.max(0, value / (max || 1) * 100))}%` }} />
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
      setBaseStats({ pvMax: character.pvMax, pvActual: character.pvActual, pdMax: character.pdMax, pdActual: character.pdActual, defense: character.defense });
    }
  }, [character]);

  if (isLoading) return <div className="min-h-screen bg-background grid place-items-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !localChar) return <div className="min-h-screen bg-background text-primary grid place-items-center font-mono">Erro ao carregar arquivo ou arquivo não encontrado.</div>;

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
      toast({ title: "MÁSCARA ATIVADA", description: "Protocolos de combate de alto risco iniciados.", variant: "destructive" });
    } else {
      updateMany({
        isMaskActive: false,
        pvMax: Math.max(0, localChar.pvMax - 20), pvActual: Math.max(0, localChar.pvActual - 20),
        pdMax: Math.max(0, localChar.pdMax - 10), pdActual: Math.max(0, localChar.pdActual - 10),
        defense: Math.max(0, localChar.defense - 10),
      });
      toast({ title: "MÁSCARA DESATIVADA", description: "Sistemas normalizados." });
    }
  };
  const activeImage = isMaskActive && localChar.maskImageUrl ? localChar.maskImageUrl : localChar.imageUrl;
  const reflexos = (localChar.skills as Record<string, number>)?.Reflexos || 0;
  const attributes = [
    ["AGI", "attAgi"], ["FOR", "attFor"], ["INT", "attInt"], ["PRE", "attPre"], ["VIG", "attVig"],
  ] as const;

  return (
    <div className={`min-h-screen scanlines transition-colors duration-1000 ${isMaskActive ? "mask-mode bg-background" : "bg-background"}`}>
      <ElementEffect element={currentElement} maskActive={isMaskActive} />
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-primary/20 px-4 py-3 flex items-center justify-between">
        {!isPlayerMode && <Link href="/" className="text-muted-foreground hover:text-primary flex items-center gap-2 font-mono text-sm uppercase"><ArrowLeft className="w-4 h-4" /> Retornar</Link>}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copiado!" }); }} className="border-primary/50 text-primary font-mono"><LinkIcon className="w-4 h-4 mr-2" /> Link</Button>
          {isMaster && <DeleteCharacterDialog characterId={localChar.id} characterName={localChar.name} onDeleted={() => setLocation("/")} trigger={<Button variant="outline" size="sm" className="border-red-500/50 text-red-500 font-mono"><Trash2 className="w-4 h-4 mr-2" /> Excluir ficha</Button>} />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <aside className="lg:col-span-4 space-y-6">
          <div className="tech-border p-2 bg-black/50">
            <div className={`relative aspect-[3/4] overflow-hidden bg-secondary border border-primary/30 cursor-pointer group ${isMaskActive ? "glow-box border-red-500" : ""}`} onDoubleClick={toggleMask} title="Duplo clique para ativar/desativar Máscara">
              {activeImage ? <img src={activeImage} alt={localChar.name} className={`w-full h-full object-cover transition-all ${isMaskActive ? "" : "grayscale group-hover:grayscale-0"}`} /> : <div className="absolute inset-0 grid place-items-center font-mono text-muted-foreground/30 text-2xl uppercase text-center">Sem imagem</div>}
              {isMaskActive && <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none mix-blend-overlay" />}
            </div>
            <div className="mt-2 space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase">URL da Imagem {isMaskActive ? "(Máscara)" : ""}</label>
              <DebouncedInput value={isMaskActive ? localChar.maskImageUrl || "" : localChar.imageUrl} onChange={(v) => update(isMaskActive ? "maskImageUrl" : "imageUrl", v)} className="tech-input text-xs" placeholder="https://..." />
              {isMaster && <div className="grid grid-cols-2 gap-1.5 pt-1">
                {ELEMENTS.map(({ id: element, label, icon: Icon, color }) => <button key={element} onClick={() => update("element", currentElement === element ? "" : element)} className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono border rounded ${color} ${currentElement === element ? "opacity-100 ring-1 ring-current" : "opacity-50"}`}><Icon className="w-3 h-3" />{label}</button>)}
              </div>}
            </div>
          </div>

          <NexProgressionPanel characterId={localChar.id} isPlayerMode={isPlayerMode} />

          <div className="tech-border p-5 space-y-4 bg-black/50">
            <div><label className="text-xs font-mono text-primary/70 uppercase">Nome do Agente</label><DebouncedInput value={localChar.name} onChange={(v) => update("name", v)} className="tech-input text-2xl font-bold uppercase" /></div>
            <div className="grid grid-cols-2 gap-4 font-mono"><div><span className="text-xs text-primary/70 uppercase">Esquiva</span><div className="text-2xl font-bold text-primary">{reflexos + localChar.defense}</div></div><div><span className="text-xs text-primary/70 uppercase">Defesa</span><DebouncedInput type="number" value={localChar.defense} onChange={(v) => update("defense", parseInt(v) || 0)} className="tech-input w-16 text-xl text-center" /></div></div>
            <ResourceBar label="Pontos de Vida (PV)" color="red" value={localChar.pvActual} max={localChar.pvMax} onValue={(v) => update("pvActual", v)} onMax={(v) => update("pvMax", v)} />
            <ResourceBar label="Pontos de Determinação (PD)" color="blue" value={localChar.pdActual} max={localChar.pdMax} onValue={(v) => update("pdActual", v)} onMax={(v) => update("pdMax", v)} />
            <div><label className="text-xs font-mono text-primary/70 uppercase">Resistências</label><DebouncedInput multiline value={localChar.resistances ?? ""} onChange={(v) => update("resistances", v)} className="bg-black/40 border-primary/20 font-mono text-sm min-h-[60px]" /></div>
            <div><label className="text-xs font-mono text-primary/70 uppercase">Aparência / Detalhes</label><DebouncedInput multiline value={localChar.appearance} onChange={(v) => update("appearance", v)} className="bg-black/40 border-primary/20 font-mono text-sm min-h-[120px]" /></div>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-8">
          <section className="tech-border p-6 bg-black/30"><h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 mb-5">Atributos</h2><div className="grid grid-cols-2 sm:grid-cols-5 gap-4">{attributes.map(([label, field]) => <div key={field} className="flex flex-col items-center"><span className="text-xs font-bold font-mono text-primary mb-1">{label}</span><DebouncedInput type="number" value={localChar[field]} onChange={(v) => update(field, parseInt(v) || 0)} className="w-16 h-16 rounded-full border-2 border-primary bg-background text-center text-2xl font-bold text-primary" /></div>)}</div></section>
          <section className="tech-border p-6 bg-black/30"><h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 mb-4">Perícias</h2><SkillList skills={localChar.skills as Record<string, number>} onChange={(v) => update("skills", v)} isMaskActive={isMaskActive} /></section>
          <section className="tech-border p-6 bg-black/30"><PowersSection powers={((isMaskActive ? localChar.maskPowers : localChar.powers) as any) || []} onChange={(v) => update(isMaskActive ? "maskPowers" : "powers", v)} type={isMaskActive ? "mask" : "normal"} /></section>
          <section className="tech-border p-6 bg-black/30"><AttacksSection attacks={((isMaskActive ? localChar.maskAttacks : localChar.attacks) as any) || []} onChange={(v) => update(isMaskActive ? "maskAttacks" : "attacks", v)} type={isMaskActive ? "mask" : "normal"} /></section>
          <section className="tech-border p-6 bg-black/30"><InventorySection inventory={(localChar.inventory as any) || []} onChange={(v) => update("inventory", v)} /></section>
          <section><h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-2 mb-4 uppercase tracking-widest">Rolar Dados</h2><DiceRoller characterId={localChar.id} characterName={localChar.name} isPlayerMode={isPlayerMode} /></section>
        </main>
      </div>
      {isMaster && <MasterShield />}
    </div>
  );
}
