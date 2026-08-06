import React, { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FlaskConical,
  LockKeyhole,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import {
  PANACEA_RITUALS,
  type PanaceaRitual,
  type PanaceaRitualElement,
} from "@/data/panacea-rituals";

export type RitualElement = PanaceaRitualElement | "medo" | "outro";

export interface CharacterRitual {
  id: string;
  name: string;
  element: RitualElement;
  circle: number;
  base: string;
  discente?: string;
  verdadeiro?: string;
  application?: string;
  source?: "panacea" | "custom";
  sourceId?: string;
  number?: number;
}

interface RitualsSectionProps {
  rituals: CharacterRitual[];
  onChange: (rituals: CharacterRitual[]) => void;
  canEdit: boolean;
  nex: number;
}

interface CustomRitualDraft {
  name: string;
  element: RitualElement;
  circle: number;
  execution: string;
  reach: string;
  target: string;
  duration: string;
  resistance: string;
  description: string;
  discente: string;
  verdadeiro: string;
}

const EMPTY_CUSTOM: CustomRitualDraft = {
  name: "",
  element: "conhecimento",
  circle: 1,
  execution: "",
  reach: "",
  target: "",
  duration: "",
  resistance: "",
  description: "",
  discente: "",
  verdadeiro: "",
};

const ELEMENT_LABELS: Record<RitualElement, string> = {
  conhecimento: "Conhecimento",
  energia: "Energia",
  sangue: "Sangue",
  morte: "Morte",
  medo: "Medo",
  outro: "Outro",
};

const ELEMENT_TONES: Record<RitualElement, string> = {
  conhecimento: "border-violet-400/35 bg-violet-400/[0.035] text-violet-200",
  energia: "border-cyan-400/35 bg-cyan-400/[0.035] text-cyan-200",
  sangue: "border-red-400/35 bg-red-400/[0.035] text-red-200",
  morte: "border-emerald-400/35 bg-emerald-400/[0.035] text-emerald-200",
  medo: "border-slate-300/35 bg-slate-300/[0.035] text-slate-200",
  outro: "border-primary/30 bg-primary/[0.035] text-primary",
};

function getMaximumCircle(nex: number): number {
  if (nex >= 85) return 4;
  if (nex >= 55) return 3;
  if (nex >= 25) return 2;
  return 1;
}

function fromPanacea(ritual: PanaceaRitual): CharacterRitual {
  return {
    id: `panacea-ritual-${ritual.id}`,
    name: ritual.name,
    element: ritual.element,
    circle: ritual.circle,
    base: ritual.base,
    discente: ritual.discente,
    verdadeiro: ritual.verdadeiro,
    application: ritual.application,
    source: "panacea",
    sourceId: ritual.id,
    number: ritual.number,
  };
}

function RitualDetails({ ritual }: { ritual: CharacterRitual }) {
  return (
    <details className="mt-3 border-t border-primary/10 pt-3">
      <summary className="cursor-pointer select-none font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary hover:text-primary/80">
        Consultar ficha completa
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/78">
        <div className="whitespace-pre-wrap border-l-2 border-primary/35 bg-background/30 p-3">
          {ritual.base}
        </div>
        {ritual.discente && (
          <div className="whitespace-pre-wrap border-l-2 border-cyan-400/35 bg-cyan-400/[0.025] p-3">
            {ritual.discente}
          </div>
        )}
        {ritual.verdadeiro && (
          <div className="whitespace-pre-wrap border-l-2 border-violet-400/35 bg-violet-400/[0.025] p-3">
            {ritual.verdadeiro}
          </div>
        )}
        {ritual.application && (
          <div className="border border-primary/15 bg-primary/[0.025] p-3">
            <p className="section-kicker">Aplicação Panacea</p>
            <p className="mt-2 whitespace-pre-wrap text-foreground/70">{ritual.application}</p>
          </div>
        )}
      </div>
    </details>
  );
}

function RitualCard({
  ritual,
  index,
  canEdit,
  onRemove,
}: {
  ritual: CharacterRitual;
  index: number;
  canEdit: boolean;
  onRemove: () => void;
}) {
  return (
    <article className="module-card group border border-primary/18 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/45">
            RIT-{String(index + 1).padStart(2, "0")} // {ritual.source === "panacea" ? `PAN-${String(ritual.number ?? 0).padStart(2, "0")}` : "REGISTRO PRÓPRIO"}
          </p>
          <h4 className="mt-1 text-lg font-bold text-primary">{ritual.name}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-wider ${ELEMENT_TONES[ritual.element]}`}>
              {ELEMENT_LABELS[ritual.element]}
            </span>
            <span className="data-chip">{ritual.circle}º círculo</span>
          </div>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-10 w-10 shrink-0 place-items-center border border-destructive/20 text-muted-foreground opacity-55 transition-colors hover:border-destructive/55 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            aria-label={`Remover ritual ${ritual.name}`}
            title="Remover ritual conhecido"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <RitualDetails ritual={ritual} />
    </article>
  );
}

export function RitualsSection({ rituals, onChange, canEdit, nex }: RitualsSectionProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [elementFilter, setElementFilter] = useState<"todos" | PanaceaRitualElement>("todos");
  const [custom, setCustom] = useState<CustomRitualDraft>(EMPTY_CUSTOM);

  const knownSourceIds = useMemo(
    () => new Set(rituals.map((ritual) => ritual.sourceId).filter(Boolean)),
    [rituals],
  );
  const panaceaUnlocked = nex >= 20;
  const maximumCircle = getMaximumCircle(nex);

  const filteredCatalog = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return PANACEA_RITUALS.filter((ritual) => {
      const matchesElement = elementFilter === "todos" || ritual.element === elementFilter;
      const matchesSearch = !normalized
        || ritual.name.toLocaleLowerCase("pt-BR").includes(normalized)
        || ritual.base.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesElement && matchesSearch;
    });
  }, [elementFilter, search]);

  const addPanacea = (ritual: PanaceaRitual) => {
    if (!canEdit || !panaceaUnlocked || knownSourceIds.has(ritual.id)) return;
    onChange([...rituals, fromPanacea(ritual)]);
  };

  const addCustom = () => {
    const name = custom.name.trim();
    if (!canEdit || !name) return;

    const base = [
      custom.execution.trim() ? `Execução ${custom.execution.trim()}` : "",
      custom.reach.trim() ? `Alcance ${custom.reach.trim()}` : "",
      custom.target.trim() ? `Alvo ou área ${custom.target.trim()}` : "",
      custom.duration.trim() ? `Duração ${custom.duration.trim()}` : "",
      custom.resistance.trim() ? `Resistência ${custom.resistance.trim()}` : "",
      custom.description.trim(),
    ].filter(Boolean).join("\n");

    onChange([
      ...rituals,
      {
        id: `custom-ritual-${nanoid()}`,
        name,
        element: custom.element,
        circle: custom.circle,
        base,
        discente: custom.discente.trim() || undefined,
        verdadeiro: custom.verdadeiro.trim() || undefined,
        source: "custom",
      },
    ]);
    setCustom(EMPTY_CUSTOM);
    setCustomOpen(false);
  };

  const removeRitual = (ritualId: string) => {
    if (!canEdit) return;
    onChange(rituals.filter((ritual) => ritual.id !== ritualId));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">ARQUIVO DE CONJURAÇÃO</p>
          <h3 className="mt-1 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-primary">
            <BookOpen className="h-4 w-4" /> Rituais conhecidos
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Círculo máximo atual: {maximumCircle}º. Protocolos Panacea básicos são liberados em NEX 20%.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setCustomOpen(true)}
              className="min-h-10 border-primary/40 text-primary"
            >
              <Plus className="mr-2 h-4 w-4" /> Ritual próprio
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!panaceaUnlocked}
              onClick={() => setCatalogOpen(true)}
              className="min-h-10 border-violet-400/40 text-violet-200 hover:bg-violet-400/10"
            >
              <FlaskConical className="mr-2 h-4 w-4" /> Catálogo Panacea
            </Button>
          </div>
        )}
      </div>

      {!panaceaUnlocked && (
        <div className="flex items-center gap-3 border border-primary/18 bg-background/30 p-4 text-sm text-muted-foreground">
          <LockKeyhole className="h-5 w-5 shrink-0 text-primary/45" />
          Os 32 protocolos ritualísticos Panacea ficam disponíveis em NEX 20%. NEX atual: {nex}%.
        </div>
      )}

      {rituals.length ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {rituals.map((ritual, index) => (
            <RitualCard
              key={ritual.id}
              ritual={ritual}
              index={index}
              canEdit={canEdit}
              onRemove={() => removeRitual(ritual.id)}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-primary/20 bg-background/20 px-5 py-10 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Nenhum ritual registrado para este operador
        </div>
      )}

      <ResponsiveFormDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        kicker="CAT-RIT // Arquivo Panacea"
        title="Protocolos ritualísticos de 1º círculo"
        description="32 rituais autorais. As formas básicas são destinadas a Ocultistas de NEX 20%; Discente e Verdadeira permanecem registradas para progressão futura."
        maxWidthClassName="max-w-5xl"
        footer={
          <Button variant="outline" onClick={() => setCatalogOpen(false)} className="border-primary/30 text-muted-foreground">
            Fechar catálogo
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/45" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 border-primary/30 bg-background/55 pl-10"
                placeholder="Buscar nome ou efeito..."
              />
            </div>
            <select
              value={elementFilter}
              onChange={(event) => setElementFilter(event.target.value as typeof elementFilter)}
              className="h-11 rounded-none border border-primary/30 bg-background/70 px-3 font-mono text-xs uppercase tracking-wider text-foreground outline-none focus:border-primary"
            >
              <option value="todos">Todos os elementos</option>
              <option value="conhecimento">Conhecimento</option>
              <option value="energia">Energia</option>
              <option value="sangue">Sangue</option>
              <option value="morte">Morte</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredCatalog.map((ritual) => {
              const selected = knownSourceIds.has(ritual.id);
              return (
                <article key={ritual.id} className="border border-primary/18 bg-background/35 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="section-kicker">PAN-{String(ritual.number).padStart(2, "0")} // {ELEMENT_LABELS[ritual.element]}</p>
                      <h4 className="mt-1 text-lg font-bold text-primary">{ritual.name}</h4>
                      <span className={`mt-2 inline-block border px-2 py-1 font-mono text-[8px] uppercase tracking-wider ${ELEMENT_TONES[ritual.element]}`}>
                        {ritual.circle}º círculo
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={selected || !panaceaUnlocked}
                      onClick={() => addPanacea(ritual)}
                      className="min-h-10 shrink-0"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {selected ? "Já conhecido" : "Adicionar ritual"}
                    </Button>
                  </div>
                  <RitualDetails ritual={fromPanacea(ritual)} />
                </article>
              );
            })}
          </div>
        </div>
      </ResponsiveFormDialog>

      <ResponsiveFormDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        kicker="REG-RIT // Cadastro do mestre"
        title="Novo ritual próprio"
        description="Registre um ritual autoral ou externo. Apenas o mestre pode criar e remover estes registros."
        maxWidthClassName="max-w-3xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setCustomOpen(false)} className="border-primary/30 text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={addCustom} disabled={!custom.name.trim()} className="bg-primary text-primary-foreground">
              Registrar ritual
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_8rem]">
            <div className="space-y-1.5">
              <label className="section-kicker">Nome</label>
              <Input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} className="border-primary/35 bg-background/65" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="section-kicker">Elemento</label>
              <select value={custom.element} onChange={(event) => setCustom({ ...custom, element: event.target.value as RitualElement })} className="h-10 w-full rounded-none border border-primary/35 bg-background/65 px-3 text-sm">
                {Object.entries(ELEMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="section-kicker">Círculo</label>
              <select value={custom.circle} onChange={(event) => setCustom({ ...custom, circle: Number(event.target.value) })} className="h-10 w-full rounded-none border border-primary/35 bg-background/65 px-3 text-sm">
                {[1, 2, 3, 4].map((circle) => <option key={circle} value={circle}>{circle}º</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Execução: padrão, completa, reação..." value={custom.execution} onChange={(event) => setCustom({ ...custom, execution: event.target.value })} className="border-primary/35 bg-background/65" />
            <Input placeholder="Alcance: toque, curto, médio..." value={custom.reach} onChange={(event) => setCustom({ ...custom, reach: event.target.value })} className="border-primary/35 bg-background/65" />
            <Input placeholder="Alvo ou área" value={custom.target} onChange={(event) => setCustom({ ...custom, target: event.target.value })} className="border-primary/35 bg-background/65" />
            <Input placeholder="Duração" value={custom.duration} onChange={(event) => setCustom({ ...custom, duration: event.target.value })} className="border-primary/35 bg-background/65" />
            <Input placeholder="Resistência" value={custom.resistance} onChange={(event) => setCustom({ ...custom, resistance: event.target.value })} className="border-primary/35 bg-background/65 sm:col-span-2" />
          </div>

          <div className="space-y-1.5">
            <label className="section-kicker">Forma básica</label>
            <Textarea value={custom.description} onChange={(event) => setCustom({ ...custom, description: event.target.value })} className="min-h-[180px] resize-y border-primary/35 bg-background/65" />
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Discente — opcional</label>
            <Textarea value={custom.discente} onChange={(event) => setCustom({ ...custom, discente: event.target.value })} className="min-h-[110px] resize-y border-cyan-400/25 bg-background/65" />
          </div>
          <div className="space-y-1.5">
            <label className="section-kicker">Verdadeiro — opcional</label>
            <Textarea value={custom.verdadeiro} onChange={(event) => setCustom({ ...custom, verdadeiro: event.target.value })} className="min-h-[110px] resize-y border-violet-400/25 bg-background/65" />
          </div>
        </div>
      </ResponsiveFormDialog>
    </div>
  );
}
