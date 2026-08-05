import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  LockKeyhole,
  PlusCircle,
  Route,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { nanoid } from "nanoid";
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
  grantType?: "standard" | "master-extra";
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

type CatalogMode = "standard" | "master-extra";

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
  disabled,
  actionLabel,
  onSelect,
}: {
  option: PanaceaPowerOption;
  selected: boolean;
  disabled?: boolean;
  actionLabel: string;
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
          disabled={disabled}
          onClick={onSelect}
          className={`min-h-10 shrink-0 ${selected ? "border-emerald-400/45 text-emerald-300" : ""}`}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {actionLabel}
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
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("standard");
  const [pendingExtra, setPendingExtra] = useState<PanaceaPowerOption | null>(null);

  const isMaster = typeof window === "undefined"
    || new URLSearchParams(window.location.search).get("mode") !== "player";
  const storedTrail = getPanaceaTrail(character?.trailId);
  const trail = storedTrail?.class === character?.characterClass ? storedTrail : undefined;
  const origin = getPanaceaOrigin(character?.originId);
  const nex = character?.nex ?? 5;
  const options = useMemo(() => getPanaceaPowersForTrail(trail?.id), [trail?.id]);
  const panaceaChoices = powers.filter((power) => power.source === "panacea-nex15");
  const standardChoice = panaceaChoices.find((power) => power.grantType !== "master-extra");
  const extraChoices = panaceaChoices.filter((power) => power.grantType === "master-extra");
  const chosenSourceIds = new Set(panaceaChoices.map((power) => power.sourceId).filter(Boolean));
  const canChoose = Boolean(trail && nex >= 15 && options.length);
  const remainingExtraOptions = options.filter((option) => !chosenSourceIds.has(option.id));

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

  const openCatalog = (mode: CatalogMode) => {
    setCatalogMode(mode);
    setPendingExtra(null);
    setCatalogOpen(true);
  };

  const chooseStandard = (option: PanaceaPowerOption) => {
    const preserved = powers.filter((power) => (
      power.source !== "panacea-nex15" || power.grantType === "master-extra"
    ));
    onChange([
      {
        id: `panacea-power-${option.id}`,
        name: option.name,
        description: option.description,
        source: "panacea-nex15",
        sourceId: option.id,
        trailId: option.trailId,
        characterClass: option.class,
        grantType: "standard",
      },
      ...preserved,
    ]);
    setCatalogOpen(false);
  };

  const requestExtra = (option: PanaceaPowerOption) => {
    if (!isMaster || chosenSourceIds.has(option.id)) return;
    setPendingExtra(option);
  };

  const confirmExtra = () => {
    if (!isMaster || !pendingExtra || chosenSourceIds.has(pendingExtra.id)) return;
    onChange([
      ...powers,
      {
        id: `panacea-extra-${nanoid()}`,
        name: pendingExtra.name,
        description: pendingExtra.description,
        source: "panacea-nex15",
        sourceId: pendingExtra.id,
        trailId: pendingExtra.trailId,
        characterClass: pendingExtra.class,
        grantType: "master-extra",
      },
    ]);
    setPendingExtra(null);
    setCatalogOpen(false);
  };

  const removeChoice = (choice: CharacterPower) => {
    const isExtra = choice.grantType === "master-extra";
    if (isExtra && !isMaster) return;
    onChange(powers.filter((power) => power.id !== choice.id));
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">ESCOLHA DE PODER // NEX 15%</p>
            <h3 className="mt-1 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-primary">
              <Route className="h-4 w-4" /> Catálogo da trilha
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Regra padrão: uma escolha. Poderes adicionais exigem concessão explícita do mestre.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canChoose}
              onClick={() => openCatalog("standard")}
              className="min-h-10 border-primary/40 text-primary"
            >
              {standardChoice ? "Trocar escolha padrão" : "Selecionar poder"}
            </Button>
            {isMaster && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canChoose || remainingExtraOptions.length === 0}
                onClick={() => openCatalog("master-extra")}
                className="min-h-10 border-amber-400/45 text-amber-200 hover:bg-amber-400/10"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Conceder poder extra
              </Button>
            )}
          </div>
        </div>

        {isMaster && canChoose && (
          <div className="flex flex-wrap gap-2">
            <span className="data-chip">Escolha padrão: {standardChoice ? 1 : 0}/1</span>
            <span className="data-chip border-amber-400/30 text-amber-200">Extras do mestre: {extraChoices.length}</span>
          </div>
        )}

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

        {panaceaChoices.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {panaceaChoices.map((choice) => {
              const compatible = options.some((option) => option.id === choice.sourceId);
              const isExtra = choice.grantType === "master-extra";
              const canRemove = !isExtra || isMaster;
              return (
                <article
                  key={choice.id}
                  className={`module-card border p-4 ${compatible ? "border-emerald-400/30" : "border-amber-400/35"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="section-kicker">
                        {!compatible
                          ? "Escolha incompatível com a trilha atual"
                          : isExtra
                            ? "Poder extra // Concessão do mestre"
                            : `Escolha padrão // ${trail?.name}`}
                      </p>
                      <h4 className="mt-1 text-lg font-bold text-primary">{choice.name}</h4>
                    </div>
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => removeChoice(choice)}
                        className="grid h-10 w-10 shrink-0 place-items-center border border-destructive/25 text-muted-foreground transition-colors hover:border-destructive/55 hover:bg-destructive/10 hover:text-destructive"
                        title={isExtra ? "Remover poder concedido pelo mestre" : "Remover escolha padrão"}
                        aria-label={`Remover ${choice.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
                    {choice.description}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {panaceaChoices.length === 0 && canChoose && (
          <div className="border border-dashed border-primary/25 bg-primary/[0.025] px-5 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {options.length} opções liberadas por {trail?.name}. Nenhuma foi escolhida.
          </div>
        )}
      </section>

      <ResponsiveFormDialog
        open={catalogOpen}
        onOpenChange={(open) => {
          setCatalogOpen(open);
          if (!open) setPendingExtra(null);
        }}
        kicker={pendingExtra ? "AUT-MESTRE // Confirmação necessária" : "CAT-PAN // Poder de classe NEX 15%"}
        title={pendingExtra
          ? "Autorizar poder extra?"
          : trail
            ? `${catalogMode === "master-extra" ? "Concessões extras" : "Opções"} de ${trail.name}`
            : "Catálogo da trilha"}
        description={pendingExtra
          ? "Esta concessão ultrapassa o limite padrão de uma escolha em NEX 15%. Confirme somente se deseja abrir uma exceção como mestre."
          : catalogMode === "master-extra"
            ? "Selecione um poder ainda não registrado. Antes de adicioná-lo, o CRIS solicitará uma confirmação clara."
            : "Escolha apenas um poder padrão. Uma nova escolha substitui somente a escolha padrão anterior e preserva concessões extras e registros personalizados."}
        maxWidthClassName="max-w-4xl"
        footer={pendingExtra ? (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingExtra(null)}
              className="h-12 border-primary/45 text-primary"
              autoFocus
            >
              Não, voltar ao catálogo
            </Button>
            <Button
              type="button"
              onClick={confirmExtra}
              className="h-12 bg-amber-500 font-bold text-black hover:bg-amber-400"
            >
              Sim, adicionar poder extra
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setCatalogOpen(false)}
            className="min-h-11 border-primary/30 text-muted-foreground"
          >
            Fechar catálogo
          </Button>
        )}
      >
        {pendingExtra ? (
          <div className="space-y-5" role="alert" aria-live="assertive">
            <div className="flex items-start gap-4 border border-amber-400/45 bg-amber-400/[0.06] p-4 sm:p-5">
              <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0 text-amber-300" />
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-200">
                  Você tem certeza que gostaria de adicionar?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  <strong className="text-foreground">{pendingExtra.name}</strong> será acrescentado como um poder extra concedido pelo mestre. A escolha padrão do personagem não será substituída.
                </p>
              </div>
            </div>

            <article className="module-card border border-primary/20 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <p className="section-kicker">Exceção autorizada pelo mestre</p>
              </div>
              <h4 className="mt-2 text-lg font-bold text-primary">{pendingExtra.name}</h4>
              <p className="mt-3 whitespace-pre-wrap border-t border-primary/10 pt-3 text-sm leading-relaxed text-foreground/75">
                {pendingExtra.description}
              </p>
            </article>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option) => {
              const isStandard = standardChoice?.sourceId === option.id;
              const alreadyGranted = chosenSourceIds.has(option.id);
              const selected = catalogMode === "standard" ? isStandard : alreadyGranted;
              const disabled = catalogMode === "master-extra" ? alreadyGranted : (alreadyGranted && !isStandard);
              const actionLabel = catalogMode === "master-extra"
                ? alreadyGranted ? "Já adicionado" : "Adicionar como extra"
                : isStandard ? "Escolha atual" : alreadyGranted ? "Já concedido como extra" : "Escolher";

              return (
                <ChoiceCard
                  key={option.id}
                  option={option}
                  selected={selected}
                  disabled={disabled}
                  actionLabel={actionLabel}
                  onSelect={() => catalogMode === "master-extra" ? requestExtra(option) : chooseStandard(option)}
                />
              );
            })}
          </div>
        )}
      </ResponsiveFormDialog>
    </div>
  );
}
