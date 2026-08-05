import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  LockKeyhole,
  Route,
  Trash2,
} from "lucide-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ResponsiveFormDialog } from "@/components/ResponsiveFormDialog";
import { useCharacter } from "@/hooks/use-characters";
import { getPanaceaOrigin, getPanaceaTrail } from "@/data/panacea-content";
import {
  getPanaceaPowersForTrail,
  type PanaceaPowerOption,
} from "@/data/panacea-powers";
import {
  getAutomaticClassAbilities,
  type AutomaticAbility,
} from "@/data/class-abilities";

export interface CharacterPower {
  id: string;
  name: string;
  description: string;
  source?: "panacea-nex15" | "custom";
  sourceId?: string;
  trailId?: string;
  characterClass?: string;
}

interface DisplayAbility {
  id: string;
  name: string;
  description: string;
  source: "class" | "origin" | "trail";
  sourceLabel: string;
}

interface AbilityCatalogProps {
  powers: CharacterPower[];
  onChange: (powers: CharacterPower[]) => void;
}

function AbilityCard({ ability, index }: { ability: DisplayAbility; index: number }) {
  return (
    <article className="module-card min-h-[132px] border border-primary/18 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/45">
            AUT-{String(index + 1).padStart(2, "0")} // {ability.sourceLabel}
          </p>
          <h4 className="mt-1 text-lg font-bold text-primary">{ability.name}</h4>
        </div>
        <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" />
      </div>
      <p className="whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
        {ability.description}
      </p>
    </article>
  );
}

function ChoiceCard({
  option,
  selected,
  onSelect,
}: {
  option: PanaceaPowerOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article className={`border p-4 ${selected ? "border-emerald-400/55 bg-emerald-400/[0.05]" : "border-primary/18 bg-background/35"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">
            {option.class.slice(0, 1).toUpperCase()}-{option.code} // {option.trail}
          </p>
          <h4 className="mt-1 text-base font-bold text-primary">{option.name}</h4>
        </div>
        <Button
          type="button"
          size="sm"
          variant={selected ? "outline" : "default"}
          onClick={onSelect}
          className={selected ? "border-emerald-400/45 text-emerald-300" : ""}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {selected ? "Selecionado" : "Escolher"}
        </Button>
      </div>
      <p className="mt-3 whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
        {option.description}
      </p>
    </article>
  );
}

export function AbilityCatalog({ powers, onChange }: AbilityCatalogProps) {
  const { id } = useParams<{ id: string }>();
  const { data: character } = useCharacter(id || "");
  const [catalogOpen, setCatalogOpen] = useState(false);

  const storedTrail = getPanaceaTrail(character?.trailId);
  const trail = storedTrail?.class === character?.characterClass ? storedTrail : undefined;
  const origin = getPanaceaOrigin(character?.originId);
  const nex = character?.nex ?? 5;
  const options = useMemo(() => getPanaceaPowersForTrail(trail?.id), [trail?.id]);
  const chosen = powers.find((power) => power.source === "panacea-nex15");
  const chosenIsCompatible = options.some((option) => option.id === chosen?.sourceId);
  const canChoose = Boolean(trail && nex >= 15 && options.length);

  const automatic = useMemo<DisplayAbility[]>(() => {
    if (!character) return [];

    const classAbilities = getAutomaticClassAbilities(character.characterClass, character.nex)
      .map((ability: AutomaticAbility): DisplayAbility => ({
        id: ability.id,
        name: ability.name,
        description: ability.description,
        source: "class",
        sourceLabel: ability.sourceLabel,
      }));

    const originAbilities: DisplayAbility[] = origin
      ? [{
          id: `origin-${origin.id}`,
          name: origin.abilityName,
          description: origin.abilityDescription,
          source: "origin",
          sourceLabel: `Origem // ${origin.name}`,
        }]
      : [];

    const trailAbilities: DisplayAbility[] = trail
      ? trail.milestones
          .filter((milestone) => character.nex >= milestone.nex)
          .map((milestone) => ({
            id: `trail-${trail.id}-${milestone.nex}`,
            name: milestone.name,
            description: milestone.description,
            source: "trail",
            sourceLabel: `Trilha // NEX ${milestone.nex}%`,
          }))
      : [];

    return [...classAbilities, ...originAbilities, ...trailAbilities];
  }, [character, origin, trail]);

  const choose = (option: PanaceaPowerOption) => {
    const preserved = powers.filter((power) => power.source !== "panacea-nex15");
    onChange([
      {
        id: `panacea-power-${option.id}`,
        name: option.name,
        description: option.description,
        source: "panacea-nex15",
        sourceId: option.id,
        trailId: option.trailId,
        characterClass: option.class,
      },
      ...preserved,
    ]);
    setCatalogOpen(false);
  };

  const removeChoice = () => {
    onChange(powers.filter((power) => power.source !== "panacea-nex15"));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="section-kicker">SINCRONIZAÇÃO AUTOMÁTICA</p>
            <h3 className="mt-1 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-primary">
              <BookOpenCheck className="h-4 w-4" /> Habilidades adquiridas
            </h3>
          </div>
          <span className="data-chip">{automatic.length}</span>
        </div>

        {automatic.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {automatic.map((ability, index) => (
              <AbilityCard key={ability.id} ability={ability} index={index} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-primary/20 bg-background/20 px-5 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Nenhuma habilidade automática liberada.
          </div>
        )}

        {trail?.id === "vetor-panacea" && (
          <div className="border border-amber-400/30 bg-amber-400/[0.04] p-3 text-sm text-amber-100/85">
            O material enviado contém as opções de NEX 15% de Vetor Panacea, mas não fornece os marcos de NEX 10%, 40%, 65% e 99%. O CRIS não inventou essas habilidades.
          </div>
        )}
      </section>

      <section className="space-y-3 border-t border-primary/15 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">ESCOLHA DE PODER // NEX 15%</p>
            <h3 className="mt-1 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-primary">
              <Route className="h-4 w-4" /> Catálogo da trilha
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canChoose}
            onClick={() => setCatalogOpen(true)}
            className="border-primary/40 text-primary"
          >
            {chosen ? "Trocar escolha" : "Selecionar poder"}
          </Button>
        </div>

        {!trail && (
          <div className="flex items-center gap-3 border border-primary/18 bg-background/30 p-4 text-sm text-muted-foreground">
            <LockKeyhole className="h-5 w-5 shrink-0 text-primary/45" />
            Selecione uma trilha compatível no arquivo de carreira.
          </div>
        )}

        {trail && nex < 15 && (
          <div className="flex items-center gap-3 border border-primary/18 bg-background/30 p-4 text-sm text-muted-foreground">
            <LockKeyhole className="h-5 w-5 shrink-0 text-primary/45" />
            Esta escolha será liberada em NEX 15%. NEX atual: {nex}%.
          </div>
        )}

        {chosen && (
          <article className={`module-card border p-4 ${chosenIsCompatible ? "border-emerald-400/30" : "border-amber-400/35"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker">
                  {chosenIsCompatible ? `Poder escolhido // ${trail?.name}` : "Escolha incompatível com a trilha atual"}
                </p>
                <h4 className="mt-1 text-lg font-bold text-primary">{chosen.name}</h4>
              </div>
              <button
                type="button"
                onClick={removeChoice}
                className="text-muted-foreground hover:text-destructive"
                title="Remover escolha"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
              {chosen.description}
            </p>
          </article>
        )}

        {!chosen && canChoose && (
          <div className="border border-dashed border-primary/25 bg-primary/[0.025] px-5 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {options.length} opções liberadas por {trail?.name}. Nenhuma foi escolhida.
          </div>
        )}
      </section>

      <ResponsiveFormDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        kicker="CAT-PAN // Poder de classe NEX 15%"
        title={trail ? `Opções de ${trail.name}` : "Catálogo da trilha"}
        description="Escolha apenas um poder. Uma nova escolha substitui somente o poder Panacea anterior e preserva registros personalizados."
        maxWidthClassName="max-w-4xl"
        footer={
          <Button variant="outline" onClick={() => setCatalogOpen(false)} className="border-primary/30 text-muted-foreground">
            Fechar catálogo
          </Button>
        }
      >
        <div className="space-y-3">
          {options.map((option) => (
            <ChoiceCard
              key={option.id}
              option={option}
              selected={chosen?.sourceId === option.id}
              onSelect={() => choose(option)}
            />
          ))}
        </div>
      </ResponsiveFormDialog>
    </div>
  );
}
