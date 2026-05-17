import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useCharacter, useUpdateCharacter, useDeleteCharacter } from "@/hooks/use-characters";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { SkillList } from "@/components/SkillList";
import { PowersSection } from "@/components/PowersSection";
import { AttacksSection } from "@/components/AttacksSection";
import { InventorySection } from "@/components/InventorySection";
import { DiceRoller } from "@/components/DiceRoller";
import { MasterShield } from "@/components/MasterShield";
import { ElementEffect } from "@/components/ElementEffect";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Link as LinkIcon, AlertTriangle, Droplets, Skull, BookOpen, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Sheet() {
  const { id } = useParams();
  const { data: character, isLoading, error } = useCharacter(id || "");
  const updateMutation = useUpdateCharacter();
  const deleteMutation = useDeleteCharacter();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const isPlayerMode = searchParams.get("mode") === "player";

  const [localChar, setLocalChar] = useState(character);
  const [baseCharStats, setBaseCharStats] = useState<Partial<typeof character>>({});

  useEffect(() => {
    if (character) {
      setLocalChar(character);
      // CRITICAL: Only capture base stats when mask is NOT active.
      // If we capture while active, the buffed values become the "base", causing accumulation.
      if (!character.isMaskActive) {
        setBaseCharStats({
          pvMax: character.pvMax,
          pvActual: character.pvActual,
          pdMax: character.pdMax,
          pdActual: character.pdActual,
          defense: character.defense,
          skills: character.skills,
        });
      }
    }
  }, [character]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !localChar) return <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono">Erro ao carregar arquivo ou arquivo não encontrado.</div>;

  const isMaskActive = localChar.isMaskActive;
  const isMaster = !isPlayerMode;

  // Esquiva = Reflexos (skill) + Defesa
  const reflexosVal = (localChar.skills as Record<string, number>)?.["Reflexos"] || 0;
  const esquiva = reflexosVal + localChar.defense;

  const handleUpdate = (field: string, value: any) => {
    if (!isMaster) return;
    const newChar = { ...localChar, [field]: value };
    setLocalChar(newChar);
    updateMutation.mutate({ id: localChar.id, updates: { [field]: value } });
  };

  const toggleMask = () => {
    const newMaskState = !isMaskActive;

    if (newMaskState) {
      // Activate mask: buff PV, PD, DEF in DB. Skills show visual +5 via SkillList (not stored).
      const basePvMax = (baseCharStats?.pvMax ?? localChar.pvMax);
      const basePvActual = (baseCharStats?.pvActual ?? localChar.pvActual);
      const basePdMax = (baseCharStats?.pdMax ?? localChar.pdMax);
      const basePdActual = (baseCharStats?.pdActual ?? localChar.pdActual);
      const baseDefense = (baseCharStats?.defense ?? localChar.defense);
      const updates = {
        isMaskActive: true,
        pvMax: basePvMax + 20,
        pvActual: basePvActual + 20,
        pdMax: basePdMax + 10,
        pdActual: basePdActual + 10,
        defense: baseDefense + 10,
      };
      setLocalChar({ ...localChar, ...updates });
      updateMutation.mutate({ id: localChar.id, updates });
      toast({ title: "MÁSCARA ATIVADA", description: "Protocolos de combate de alto risco iniciados.", variant: "destructive" });
    } else {
      // Deactivate mask: subtract buffs from CURRENT (buffed) values, not from base.
      // pvMax was buffed +20 → restore = current - 20 = original pvMax
      // pvActual loses 20 from current value (penalty for removing mask)
      // pdMax was buffed +10 → restore = current - 10 = original pdMax
      // pdActual loses 10 from current value
      // defense was buffed +10 → restore = current - 10 = original defense
      const updates = {
        isMaskActive: false,
        pvMax: Math.max(0, localChar.pvMax - 20),
        pvActual: Math.max(0, localChar.pvActual - 20),
        pdMax: Math.max(0, localChar.pdMax - 10),
        pdActual: Math.max(0, localChar.pdActual - 10),
        defense: Math.max(0, localChar.defense - 10),
      };
      setLocalChar({ ...localChar, ...updates });
      updateMutation.mutate({ id: localChar.id, updates });
      toast({ title: "MÁSCARA DESATIVADA", description: "Sistemas normalizados." });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(localChar.id);
      setLocation("/");
    } catch (e) {
      toast({ title: "Erro ao deletar", variant: "destructive" });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copiado!", description: "Envie este link para seu jogador." });
  };

  const currentElement = (localChar.element || "") as "sangue" | "morte" | "conhecimento" | "energia" | "";

  const ELEMENTS = [
    { id: "sangue", label: "Sangue", icon: Droplets, color: "text-red-500 border-red-500/60 hover:bg-red-500/20" },
    { id: "morte", label: "Morte", icon: Skull, color: "text-green-700 border-green-700/60 hover:bg-green-700/20" },
    { id: "conhecimento", label: "Conhecimento", icon: BookOpen, color: "text-violet-400 border-violet-400/60 hover:bg-violet-400/20" },
    { id: "energia", label: "Energia", icon: Zap, color: "text-purple-400 border-purple-400/60 hover:bg-purple-400/20" },
  ] as const;

  return (
    <div className={`min-h-screen scanlines transition-colors duration-1000 ${isMaskActive ? 'mask-mode bg-background' : 'bg-background'}`}>

      {/* Element visual effect — always rendered, player can't edit selector */}
      <ElementEffect element={currentElement} maskActive={isMaskActive} />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-primary/20 px-4 py-3 flex items-center justify-between">
        {!isPlayerMode && (
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-mono text-sm uppercase">
            <ArrowLeft className="w-4 h-4" /> Retornar
          </Link>
        )}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-primary/50 text-primary hover:bg-primary/20 font-mono">
            <LinkIcon className="w-4 h-4 mr-2" /> Link
          </Button>
          {!isPlayerMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/20 font-mono">
                  <Trash2 className="w-4 h-4 mr-2" /> Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="tech-border border-red-500">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-500 flex items-center gap-2 uppercase font-mono">
                    <AlertTriangle /> Confirmar Exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Tem certeza que deseja expurgar os dados deste agente? Esta ação é irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-primary text-primary">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">Expurgar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* SIDEBAR (Left) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Portrait & Mask Toggle */}
          <div className="tech-border p-2 bg-black/50">
            <div
              className={`relative aspect-[3/4] w-full bg-secondary overflow-hidden border border-primary/30 cursor-pointer select-none group ${isMaskActive ? 'glow-box shadow-red-500/50 border-red-500' : ''}`}
              onDoubleClick={toggleMask}
              title="Duplo clique para ativar/desativar Máscara"
            >
              {(() => {
                const activeImg = isMaskActive && localChar.maskImageUrl ? localChar.maskImageUrl : localChar.imageUrl;
                return activeImg ? (
                  <img
                    key={activeImg}
                    src={activeImg}
                    alt="Portrait"
                    className={`w-full h-full object-cover transition-all duration-700 ${isMaskActive ? '' : 'grayscale group-hover:grayscale-0'}`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-muted-foreground/30 text-2xl uppercase text-center px-4">Sem Imagem<br /><span className="text-xs">Duplo clique: Máscara</span></span>
                  </div>
                );
              })()}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
              {isMaskActive && (
                <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none mix-blend-overlay" />
              )}
            </div>
            <div className="mt-2 space-y-2">
              {!isMaskActive && (
                <div>
                  <label className="text-xs font-mono text-primary/70 uppercase">URL da Imagem</label>
                  <DebouncedInput
                    value={localChar.imageUrl}
                    onChange={(val) => handleUpdate('imageUrl', val)}
                    className="tech-input text-xs"
                    placeholder="https://..."
                  />
                </div>
              )}
              {isMaskActive && (
                <div>
                  <label className="text-xs font-mono text-red-400/80 uppercase">URL da Imagem (Máscara)</label>
                  <DebouncedInput
                    value={localChar.maskImageUrl || ""}
                    onChange={(val) => handleUpdate('maskImageUrl', val)}
                    className="tech-input text-xs border-red-500/30 focus:border-red-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Element selector — master only */}
              {isMaster && (
                <div className="pt-1">
                  <label className="text-xs font-mono text-primary/50 uppercase block mb-2">Elemento</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ELEMENTS.map(({ id, label, icon: Icon, color }) => (
                      <button
                        key={id}
                        onClick={() => handleUpdate('element', currentElement === id ? "" : id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono border rounded transition-all ${color} ${currentElement === id ? 'opacity-100 bg-opacity-30 ring-1 ring-current' : 'opacity-50'}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {currentElement && (
                    <button
                      onClick={() => handleUpdate('element', "")}
                      className="mt-1.5 w-full text-xs font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors uppercase"
                    >
                      × Remover efeito
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Identity & Basic Stats */}
          <div className="tech-border p-5 space-y-4 bg-black/50">
            <div>
              <label className="text-xs font-mono text-primary/70 uppercase block mb-1">Nome do Agente</label>
              <DebouncedInput
                value={localChar.name}
                onChange={(val) => handleUpdate('name', val)}
                className="tech-input text-2xl font-bold uppercase tracking-wider text-foreground p-0 border-b-primary focus:border-b-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Esquiva = Reflexos + Defesa (calculado) */}
              <div>
                <label className="text-xs font-mono text-primary/70 uppercase block mb-1">Esquiva</label>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-primary font-mono">{esquiva}</span>
                  <span className="text-xs text-muted-foreground font-mono ml-1">(Ref+Def)</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-primary/70 uppercase block mb-1">Defesa</label>
                <DebouncedInput
                  type="number"
                  value={localChar.defense}
                  onChange={(val) => handleUpdate('defense', parseInt(val) || 0)}
                  className={`tech-input w-12 text-xl p-0 text-center font-bold ${isMaskActive ? 'opacity-50' : 'text-primary'}`}
                />
              </div>
            </div>

            {/* PV Bar */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs font-mono font-bold uppercase items-end">
                <span className="text-red-500">Pontos de Vida (PV)</span>
                <div className="flex items-center gap-1">
                  <DebouncedInput
                    type="number"
                    value={localChar.pvActual}
                    onChange={(val) => handleUpdate('pvActual', parseInt(val) || 0)}
                    className="tech-input w-12 text-right p-0 text-foreground"
                  />
                  <span className="text-muted-foreground">/</span>
                  <DebouncedInput
                    type="number"
                    value={localChar.pvMax}
                    onChange={(val) => handleUpdate('pvMax', parseInt(val) || 0)}
                    className="tech-input w-10 p-0 text-muted-foreground"
                    title="Máximo"
                  />
                </div>
              </div>
              <div className="h-4 bg-secondary w-full relative overflow-hidden border border-red-900/30">
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (localChar.pvActual / (localChar.pvMax || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* PD Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold uppercase items-end">
                <span className="text-blue-500">Pontos de Sanidade (PD)</span>
                <div className="flex items-center gap-1">
                  <DebouncedInput
                    type="number"
                    value={localChar.pdActual}
                    onChange={(val) => handleUpdate('pdActual', parseInt(val) || 0)}
                    className="tech-input w-12 text-right p-0 text-foreground"
                  />
                  <span className="text-muted-foreground">/</span>
                  <DebouncedInput
                    type="number"
                    value={localChar.pdMax}
                    onChange={(val) => handleUpdate('pdMax', parseInt(val) || 0)}
                    className="tech-input w-10 p-0 text-muted-foreground"
                  />
                </div>
              </div>
              <div className="h-4 bg-secondary w-full relative overflow-hidden border border-blue-900/30">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (localChar.pdActual / (localChar.pdMax || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Resistências */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-primary/70 uppercase block">Resistências</label>
              <DebouncedInput
                multiline
                value={localChar.resistances ?? ""}
                onChange={(val) => handleUpdate('resistances', val)}
                className="bg-black/40 border-primary/20 font-mono text-sm min-h-[60px] focus-visible:ring-primary/50 text-muted-foreground hover:text-foreground transition-colors"
                placeholder="Ex: Resistente a fogo, imune a veneno..."
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-mono text-primary/70 uppercase block mb-1">Aparência / Detalhes</label>
              <DebouncedInput
                multiline
                value={localChar.appearance}
                onChange={(val) => handleUpdate('appearance', val)}
                className="bg-black/40 border-primary/20 font-mono text-sm min-h-[120px] focus-visible:ring-primary/50 text-muted-foreground hover:text-foreground transition-colors"
                placeholder="Descrição física, roupas, cicatrizes..."
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT (Right) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Attributes Cross/Diamond Layout */}
          <div className="tech-border p-6 bg-black/30 relative">
            <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 mb-8">Atributos</h2>
            <div className="relative w-full max-w-sm mx-auto aspect-square">
              <svg className="absolute inset-0 w-full h-full text-primary/20 pointer-events-none" viewBox="0 0 100 100">
                <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-xs font-bold font-mono text-primary mb-1 uppercase tracking-widest">AGI</span>
                <DebouncedInput type="number" value={localChar.attAgi} onChange={(val) => handleUpdate('attAgi', parseInt(val) || 0)} className="w-16 h-16 rounded-full border-2 border-primary bg-background text-center text-2xl font-bold glow-box text-primary focus:ring-0 focus:border-primary" />
              </div>
              <div className="absolute top-1/2 right-[5%] translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-xs font-bold font-mono text-primary mb-1 uppercase tracking-widest">INT</span>
                <DebouncedInput type="number" value={localChar.attInt} onChange={(val) => handleUpdate('attInt', parseInt(val) || 0)} className="w-16 h-16 rounded-full border-2 border-primary bg-background text-center text-2xl font-bold glow-box text-primary focus:ring-0 focus:border-primary" />
              </div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                <DebouncedInput type="number" value={localChar.attVig} onChange={(val) => handleUpdate('attVig', parseInt(val) || 0)} className="w-16 h-16 rounded-full border-2 border-primary bg-background text-center text-2xl font-bold glow-box text-primary focus:ring-0 focus:border-primary" />
                <span className="text-xs font-bold font-mono text-primary mt-1 uppercase tracking-widest">VIG</span>
              </div>
              <div className="absolute top-1/2 left-[5%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-xs font-bold font-mono text-primary mb-1 uppercase tracking-widest">FOR</span>
                <DebouncedInput type="number" value={localChar.attFor} onChange={(val) => handleUpdate('attFor', parseInt(val) || 0)} className="w-16 h-16 rounded-full border-2 border-primary bg-background text-center text-2xl font-bold glow-box text-primary focus:ring-0 focus:border-primary" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <span className="text-xs font-bold font-mono text-primary absolute -top-6 uppercase tracking-widest bg-background px-1">PRE</span>
                <DebouncedInput type="number" value={localChar.attPre} onChange={(val) => handleUpdate('attPre', parseInt(val) || 0)} className="w-20 h-20 rounded-full border-4 border-primary bg-card text-center text-3xl font-bold glow-box text-primary focus:ring-0 focus:border-primary shadow-[0_0_30px_-5px_var(--glow-color)]" />
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="tech-border p-6 bg-black/30">
            <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-1 mb-4 flex justify-between items-end">
              <span>Perícias</span>
              {isMaskActive && <span className="text-xs font-mono text-primary animate-pulse tracking-widest">BUFF +5 ATIVO (BASE &gt; 0)</span>}
            </h2>
            <SkillList
              skills={localChar.skills as Record<string, number>}
              onChange={(newSkills) => handleUpdate('skills', newSkills)}
              isMaskActive={isMaskActive}
            />
          </div>

          {/* Powers */}
          <div className="tech-border p-6 bg-black/30">
            {isMaskActive ? (
              <PowersSection
                powers={(localChar.maskPowers as any) || []}
                onChange={(newPowers) => handleUpdate('maskPowers', newPowers)}
                type="mask"
              />
            ) : (
              <PowersSection
                powers={(localChar.powers as any) || []}
                onChange={(newPowers) => handleUpdate('powers', newPowers)}
                type="normal"
              />
            )}
          </div>

          {/* Attacks */}
          <div className="tech-border p-6 bg-black/30">
            {isMaskActive ? (
              <AttacksSection
                attacks={(localChar.maskAttacks as any) || []}
                onChange={(newAttacks) => handleUpdate('maskAttacks', newAttacks)}
                type="mask"
              />
            ) : (
              <AttacksSection
                attacks={(localChar.attacks as any) || []}
                onChange={(newAttacks) => handleUpdate('attacks', newAttacks)}
                type="normal"
              />
            )}
          </div>

          {/* Inventory */}
          <div className="tech-border p-6 bg-black/30">
            <InventorySection
              inventory={(localChar.inventory as any) || []}
              onChange={(newInventory) => handleUpdate('inventory', newInventory)}
            />
          </div>

          {/* Dice Roller */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-primary glow-text border-b border-primary/30 pb-2 mb-4 uppercase tracking-widest">Rolar Dados</h2>
            <DiceRoller
              characterId={localChar.id}
              characterName={localChar.name}
              isPlayerMode={isPlayerMode}
            />
          </div>

        </div>
      </div>
      {isMaster && <MasterShield />}
    </div>
  );
}
