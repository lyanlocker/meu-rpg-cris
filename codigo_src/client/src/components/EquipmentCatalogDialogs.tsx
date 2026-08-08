import React, { useMemo, useState } from "react";
import { BookOpen, Plus, Search, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EQUIPMENT_SOURCES,
  LOADOUT_CATALOG,
  PARANORMAL_ITEM_CATALOG,
  WEAPON_CATALOG,
  type EquipmentSource,
  type LoadoutCatalogEntry,
  type ParanormalCatalogEntry,
  type WeaponCatalogEntry,
} from "@/data/equipmentCatalog";

const ALL = "__all__";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function SourceSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-0 border border-primary/30 bg-background/80 px-3 font-mono text-xs text-foreground outline-none focus:border-primary"
    >
      <option value={ALL}>Todas as fontes</option>
      {EQUIPMENT_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
    </select>
  );
}

function CatalogShell({
  title,
  description,
  trigger,
  query,
  setQuery,
  source,
  setSource,
  extraFilter,
  children,
  count,
}: {
  title: string;
  description: string;
  trigger: React.ReactNode;
  query: string;
  setQuery: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  extraFilter?: React.ReactNode;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl flex-col gap-0 overflow-hidden border-primary/55 bg-background/95 p-0 shadow-2xl shadow-primary/20 sm:max-h-[calc(100dvh-2rem)]">
        <DialogHeader className="shrink-0 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent px-5 py-5 pr-14 text-left">
          <p className="section-kicker">ARQ-EQP // Biblioteca de fontes</p>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-primary">
            <BookOpen className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription className="max-w-3xl text-sm leading-relaxed">{description}</DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-3 border-b border-primary/15 bg-background/85 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(13rem,auto)_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/55" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar por nome, tipo ou dados..."
                className="h-10 border-primary/30 bg-background/80 pl-9 font-mono text-xs"
              />
            </label>
            <SourceSelect value={source} onChange={setSource} />
            {extraFilter}
          </div>
          <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/65">
            <span>Valores são transcritos das fontes; campos não informados aparecem como —</span>
            <span className="data-chip shrink-0">{count} registros</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WeaponCatalogButton({ onSelect }: { onSelect: (entry: WeaponCatalogEntry) => void }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState(ALL);
  const [group, setGroup] = useState(ALL);
  const groups = useMemo(() => Array.from(new Set(WEAPON_CATALOG.map((entry) => entry.group))).sort(), []);
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return WEAPON_CATALOG.filter((entry) => {
      if (source !== ALL && entry.source !== source) return false;
      if (group !== ALL && entry.group !== group) return false;
      if (!needle) return true;
      return normalize(`${entry.name} ${entry.group} ${entry.source} ${entry.damage} ${entry.critical} ${entry.range} ${entry.damageType}`).includes(needle);
    });
  }, [query, source, group]);

  return (
    <CatalogShell
      title="Catálogo de armas"
      description="Armas das fontes da campanha com categoria, espaço, dano, crítico, alcance e tipo. Adicionar pelo catálogo não remove armas registradas manualmente."
      trigger={<Button size="sm" variant="outline" className="border-amber-400/40 bg-amber-400/[0.035] font-mono text-xs uppercase text-amber-200 hover:bg-amber-400/10"><Swords className="mr-2 h-4 w-4" /> Catálogo de armas</Button>}
      query={query}
      setQuery={setQuery}
      source={source}
      setSource={setSource}
      count={filtered.length}
      extraFilter={
        <select value={group} onChange={(event) => setGroup(event.target.value)} className="h-10 border border-primary/30 bg-background/80 px-3 font-mono text-[10px] text-foreground outline-none focus:border-primary">
          <option value={ALL}>Todos os grupos</option>
          {groups.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filtered.map((entry) => (
          <article key={entry.id} className="module-card space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="section-kicker">{entry.source}</p>
                <h3 className="mt-1 break-words text-base font-bold text-primary">{entry.name}</h3>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{entry.group}</p>
              </div>
              <Button size="sm" onClick={() => onSelect(entry)} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/85">
                <Plus className="mr-1.5 h-4 w-4" /> Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase tracking-wider sm:grid-cols-6">
              {[
                ["Cat.", entry.category], ["Esp.", entry.spaces], ["Dano", entry.damage],
                ["Crítico", entry.critical], ["Alcance", entry.range], ["Tipo", entry.damageType],
              ].map(([label, value]) => (
                <div key={label} className="border border-primary/15 bg-background/40 px-2 py-2 text-muted-foreground">
                  {label}<span className="mt-1 block normal-case text-foreground">{value}</span>
                </div>
              ))}
            </div>
            {entry.summary && <p className="border-t border-primary/10 pt-2 text-xs leading-relaxed text-foreground/65">{entry.summary}</p>}
          </article>
        ))}
        {filtered.length === 0 && <div className="col-span-full border border-dashed border-primary/20 py-10 text-center font-mono text-xs uppercase text-muted-foreground">Nenhuma arma corresponde aos filtros.</div>}
      </div>
    </CatalogShell>
  );
}

export function LoadoutCatalogButton({ onSelect }: { onSelect: (entry: LoadoutCatalogEntry) => void }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const kinds = useMemo(() => Array.from(new Set(LOADOUT_CATALOG.map((entry) => entry.kind))).sort(), []);
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return LOADOUT_CATALOG.filter((entry) => {
      if (source !== ALL && entry.source !== source) return false;
      if (kind !== ALL && entry.kind !== kind) return false;
      if (!needle) return true;
      return normalize(`${entry.name} ${entry.kind} ${entry.source} ${entry.category} ${entry.spaces} ${entry.summary}`).includes(needle);
    });
  }, [query, source, kind]);

  return (
    <CatalogShell
      title="Catálogo de carga operacional"
      description="Munições, proteções, acessórios, explosivos, medicamentos, itens operacionais e vestimentas localizados nas fontes da campanha."
      trigger={<Button size="sm" variant="outline" className="border-primary/40 bg-primary/[0.035] font-mono text-xs uppercase text-primary hover:bg-primary/10"><BookOpen className="mr-2 h-4 w-4" /> Catálogo de carga</Button>}
      query={query}
      setQuery={setQuery}
      source={source}
      setSource={setSource}
      count={filtered.length}
      extraFilter={
        <select value={kind} onChange={(event) => setKind(event.target.value)} className="h-10 border border-primary/30 bg-background/80 px-3 font-mono text-[10px] text-foreground outline-none focus:border-primary">
          <option value={ALL}>Todos os tipos</option>
          {kinds.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <article key={entry.id} className="module-card flex flex-col gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="section-kicker">{entry.source}</p>
              <h3 className="mt-1 break-words font-bold text-primary">{entry.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="data-chip">{entry.kind}</span>
                <span className="data-chip">Cat. {entry.category}</span>
                <span className="data-chip">{entry.spaces} esp.</span>
              </div>
              {entry.summary && <p className="mt-3 text-xs leading-relaxed text-foreground/65">{entry.summary}</p>}
            </div>
            <Button size="sm" onClick={() => onSelect(entry)} className="w-full bg-primary text-primary-foreground hover:bg-primary/85">
              <Plus className="mr-2 h-4 w-4" /> Adicionar à carga
            </Button>
          </article>
        ))}
        {filtered.length === 0 && <div className="col-span-full border border-dashed border-primary/20 py-10 text-center font-mono text-xs uppercase text-muted-foreground">Nenhum item corresponde aos filtros.</div>}
      </div>
    </CatalogShell>
  );
}

export function ParanormalCatalogButton({ onSelect }: { onSelect: (entry: ParanormalCatalogEntry) => void }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState(ALL);
  const [element, setElement] = useState(ALL);
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return PARANORMAL_ITEM_CATALOG.filter((entry) => {
      if (source !== ALL && entry.source !== source) return false;
      if (element !== ALL && entry.element !== element) return false;
      if (!needle) return true;
      return normalize(`${entry.name} ${entry.source} ${entry.element} ${entry.category} ${entry.spaces}`).includes(needle);
    });
  }, [query, source, element]);

  return (
    <CatalogShell
      title="Catálogo paranormal das fontes"
      description="Itens paranormais e amaldiçoados encontrados nas fontes. Entradas de elemento variável ou sem elemento definido aparecem como 'neutro' e podem ser ajustadas depois pelo mestre."
      trigger={<Button size="sm" variant="outline" className="border-violet-400/40 bg-violet-400/[0.035] font-mono text-xs uppercase text-violet-200 hover:bg-violet-400/10"><Shield className="mr-2 h-4 w-4" /> Catálogo paranormal</Button>}
      query={query}
      setQuery={setQuery}
      source={source}
      setSource={setSource}
      count={filtered.length}
      extraFilter={
        <select value={element} onChange={(event) => setElement(event.target.value)} className="h-10 border border-violet-400/30 bg-background/80 px-3 font-mono text-[10px] text-foreground outline-none focus:border-violet-300">
          <option value={ALL}>Todos os elementos</option>
          <option value="sangue">Sangue</option><option value="morte">Morte</option><option value="conhecimento">Conhecimento</option><option value="energia">Energia</option><option value="medo">Medo</option><option value="neutro">Neutro / variável</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <article key={entry.id} className="module-card flex flex-col gap-3 border-violet-400/15 p-4">
            <div className="flex-1">
              <p className="section-kicker">{entry.source}</p>
              <h3 className="mt-1 break-words font-bold text-primary">{entry.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="data-chip">{entry.element}</span><span className="data-chip">Cat. {entry.category}</span><span className="data-chip">{entry.spaces} esp.</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-foreground/65">{entry.summary}</p>
            </div>
            <Button size="sm" onClick={() => onSelect(entry)} className="w-full bg-violet-500 text-white hover:bg-violet-400">
              <Plus className="mr-2 h-4 w-4" /> Adicionar item paranormal
            </Button>
          </article>
        ))}
        {filtered.length === 0 && <div className="col-span-full border border-dashed border-violet-400/20 py-10 text-center font-mono text-xs uppercase text-muted-foreground">Nenhum item paranormal corresponde aos filtros.</div>}
      </div>
    </CatalogShell>
  );
}
