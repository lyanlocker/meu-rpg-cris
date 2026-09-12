"use client";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase";
import { freshSheet, sheetSchema, type Sheet } from "@/lib/model";
import type { Entry } from "@/lib/catalog";
import SheetEditor, { type RollInput } from "./sheet-editor";

type Row = { id: string; data: Sheet; revision: number };
type Member = { email: string; role: string };
type DiceRoll = RollInput & {
  id: number;
  character_name: string;
  rolled_at: string;
};
const PLAYER_DOMAIN = "players.sistema-onix.app";
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 48);
const authEmail = (access: string) => {
  const value = access.trim().toLowerCase();
  return value.includes("@") ? value : `${slugify(value)}@${PLAYER_DOMAIN}`;
};
const visibleAccess = (email: string) =>
  email.endsWith(`@${PLAYER_DOMAIN}`)
    ? email.slice(0, -PLAYER_DOMAIN.length - 1)
    : email;

function LiveRolls({ rolls }: { rolls: DiceRoll[] }) {
  return (
    <section className="live-rolls" aria-label="Rolagens ao vivo">
      <div className="sectionhead">
        <div>
          <p className="eyebrow">TRANSMISSÃO DA MESA</p>
          <h2>Rolagens ao vivo</h2>
        </div>
        <span className="live-indicator">● conectado</span>
      </div>
      <div className="roll-feed" aria-live="polite">
        {rolls.map((r) => (
          <article key={r.id} className="roll-card">
            <div>
              <strong>{r.character_name}</strong>
              <span>{r.label}</span>
            </div>
            <div className="roll-values">
              <small>{r.expression}</small>
              <span>{r.results.join(" · ")}</span>
              <b>{r.total}</b>
            </div>
            <time dateTime={r.rolled_at}>
              {new Date(r.rolled_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </time>
          </article>
        ))}
        {!rolls.length && (
          <p className="muted">
            As rolagens dos jogadores aparecerão aqui imediatamente.
          </p>
        )}
      </div>
    </section>
  );
}

export default function Onix() {
  const [role, setRole] = useState(""),
    [catalog, setCatalog] = useState<Entry[]>([]),
    [members, setMembers] = useState<Member[]>([]);
  const [user, setUser] = useState(""),
    [displayName, setDisplayName] = useState(""),
    [ready, setReady] = useState(false),
    [rows, setRows] = useState<Row[]>([]),
    [active, setActive] = useState<Row | null>(null),
    [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [authMode, setAuthMode] = useState<"login" | "activate">("login"),
    [accessMode, setAccessMode] = useState<"create" | "reset">("create"),
    [characterName, setCharacterName] = useState(""),
    [accessId, setAccessId] = useState("");
  const report = useCallback(
    (e: unknown) =>
      setMessage(
        e instanceof Error
          ? e.message
          : "Não foi possível concluir a operação.",
      ),
    [],
  );
  const load = useCallback(async () => {
    const me = await db.auth.getUser();
    if (!me.data.user) return;
    const email = me.data.user.email?.toLowerCase() || "";
    setDisplayName(
      String(
        me.data.user.user_metadata?.character_name || visibleAccess(email),
      ),
    );
    const access = await db
      .from("members")
      .select("role")
      .eq("email", email)
      .maybeSingle();
    if (access.error) throw access.error;
    setRole(access.data?.role || "");
    if (!access.data) {
      setCatalog([]);
      setRows([]);
      return;
    }
    const characters = db
      .from("characters")
      .select("id,data,revision")
      .order("updated_at", { ascending: false });
    const books = db.from("catalog").select("data").limit(1000);
    const memberRows =
      access.data.role === "master"
        ? db.from("members").select("email,role").order("email")
        : Promise.resolve({ data: [] as Member[], error: null });
    const recent =
      access.data.role === "master"
        ? db
            .from("dice_rolls")
            .select("*")
            .order("rolled_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [] as DiceRoll[], error: null });
    const [c, b, m, d] = await Promise.all([
      characters,
      books,
      memberRows,
      recent,
    ]);
    if (c.error) throw c.error;
    if (b.error) throw b.error;
    if (m.error) throw m.error;
    if (d.error) throw d.error;
    setCatalog((b.data || []).map((x) => x.data as Entry));
    setMembers(m.data || []);
    setRows(
      (c.data || []).map((r) => ({ ...r, data: sheetSchema.parse(r.data) })),
    );
    setRolls((d.data || []) as DiceRoll[]);
  }, []);
  useEffect(() => {
    db.auth.getSession().then(({ data, error }) => {
      if (error) report(error);
      setUser(data.session?.user.email || "");
      setReady(true);
      if (data.session) load().catch(report);
    });
    const { data } = db.auth.onAuthStateChange((event, session) => {
      setUser(session?.user.email || "");
      if (event === "SIGNED_OUT") {
        setActive(null);
        setRows([]);
        setDirty(false);
        setRole("");
        setCatalog([]);
        setMembers([]);
        setRolls([]);
      }
      if (event === "SIGNED_IN") setTimeout(() => load().catch(report), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [load, report]);
  useEffect(() => {
    if (role !== "master") return;
    const channel = db
      .channel("master-live-rolls")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dice_rolls" },
        (payload) =>
          setRolls((current) =>
            [payload.new as DiceRoll, ...current].slice(0, 50),
          ),
      )
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [role]);
  useEffect(() => {
    const leavePage = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leavePage);
    return () => window.removeEventListener("beforeunload", leavePage);
  }, [dirty]);
  async function authenticate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget),
      access = String(f.get("access") || ""),
      password = String(f.get("password") || "");
    try {
      const r =
        authMode === "activate"
          ? await db.auth.signUp({
              email: access.trim().toLowerCase(),
              password,
              options: { emailRedirectTo: location.origin },
            })
          : await db.auth.signInWithPassword({
              email: authEmail(access),
              password,
            });
      if (r.error) throw r.error;
      if (authMode === "activate") {
        setMessage(
          "Confira seu e-mail para confirmar o primeiro acesso do mestre.",
        );
        setAuthMode("login");
      }
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  const canLeave = () => !dirty || confirm("Descartar alterações não salvas?");
  async function create(data = freshSheet()) {
    if (!canLeave()) return;
    setBusy(true);
    try {
      const r = await db
        .from("characters")
        .insert({ data: sheetSchema.parse(data) })
        .select("id,data,revision")
        .single();
      if (r.error) throw r.error;
      setActive({ ...r.data, data: sheetSchema.parse(r.data.data) });
      setDirty(false);
      await load();
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!active) return;
    setBusy(true);
    try {
      const r = await db
        .from("characters")
        .update({
          data: sheetSchema.parse(active.data),
          revision: active.revision + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", active.id)
        .eq("revision", active.revision)
        .select("id,data,revision")
        .single();
      if (r.error)
        throw Error(
          "Não foi possível salvar. Outra janela pode ter alterado esta ficha.",
        );
      setActive({ ...r.data, data: sheetSchema.parse(r.data.data) });
      setDirty(false);
      setMessage("Ficha salva.");
      await load();
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  async function manageAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    try {
      const { data, error } = await db.functions.invoke(
        "manage-player-access",
        {
          body: {
            action: accessMode,
            accessId: String(f.get("accessId") || ""),
            characterName: String(f.get("characterName") || ""),
            password: String(f.get("password") || ""),
          },
        },
      );
      if (error) throw error;
      if (!data?.ok)
        throw Error(data?.error || "Não foi possível configurar o acesso.");
      setMessage(
        accessMode === "create"
          ? "Acesso do jogador criado."
          : "Senha do jogador atualizada.",
      );
      setCharacterName("");
      setAccessId("");
      e.currentTarget.reset();
      await load();
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  async function recordRoll(r: RollInput) {
    if (!active) return;
    const result = await db.from("dice_rolls").insert({
      ...r,
      character_id: active.id,
      character_name: active.data.name || displayName || "Sobrevivente",
    });
    if (result.error) report(result.error);
  }
  function download() {
    if (!active) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(active.data, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ficha-onix.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!ready)
    return (
      <main className="auth">
        <p>Carregando…</p>
      </main>
    );
  if (!user)
    return (
      <main className="auth">
        <div className="brand">
          ◈ ONIX <small>SISTEMA DE FICHAS</small>
        </div>
        <section>
          <p className="eyebrow">SEU PRÓXIMO CAPÍTULO</p>
          <h1>
            Sobreviva.
            <br />
            Deixe sua marca.
          </h1>
          <p>Use o acesso e a senha entregues pelo mestre.</p>
          <form onSubmit={authenticate}>
            <h2>{authMode === "login" ? "Entrar" : "Ativar mestre"}</h2>
            <label>
              {authMode === "login" ? "Acesso" : "E-mail autorizado do mestre"}
              <input
                name="access"
                type={authMode === "login" ? "text" : "email"}
                required
                autoComplete="username"
              />
            </label>
            <label>
              {authMode === "login" ? "Senha" : "Criar senha"}
              <input
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete={
                  authMode === "activate" ? "new-password" : "current-password"
                }
              />
            </label>
            <button className="primary" disabled={busy}>
              {busy ? "Aguarde…" : "Continuar"}
            </button>
            <div className="authlinks">
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "activate" : "login")
                }
              >
                {authMode === "login"
                  ? "Primeiro acesso do mestre"
                  : "Voltar para entrar"}
              </button>
            </div>
          </form>
          <p role="status">{message}</p>
        </section>
      </main>
    );
  if (!role)
    return (
      <main className="auth">
        <div className="brand">◈ ONIX</div>
        <section>
          <h1>Acesso restrito</h1>
          <p>
            Este acesso foi revogado ou ainda não foi autorizado pelo mestre.
          </p>
          <p role="status">{message}</p>
          <button onClick={() => load().catch(report)}>
            Verificar autorização
          </button>
          <button onClick={() => db.auth.signOut()}>Sair</button>
        </section>
      </main>
    );
  return (
    <>
      <header>
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            if (!canLeave()) e.preventDefault();
          }}
        >
          ◈ ONIX
        </a>
        <span>{role === "master" ? "Central do mestre" : "Minha ficha"}</span>
        <div className="account">
          {displayName}
          <button
            onClick={async () => {
              if (canLeave()) await db.auth.signOut();
            }}
          >
            Sair
          </button>
        </div>
      </header>
      <main className="workspace">
        {role === "master" && (
          <div className="master-grid">
            <details className="access-manager" open>
              <summary>Acessos dos jogadores</summary>
              <div className="access-tabs">
                <button
                  className={accessMode === "create" ? "selected" : ""}
                  onClick={() => setAccessMode("create")}
                >
                  Criar acesso
                </button>
                <button
                  className={accessMode === "reset" ? "selected" : ""}
                  onClick={() => setAccessMode("reset")}
                >
                  Trocar senha
                </button>
              </div>
              <form onSubmit={manageAccess}>
                {accessMode === "create" && (
                  <label>
                    Nome do personagem
                    <input
                      name="characterName"
                      required
                      value={characterName}
                      onChange={(e) => {
                        const old = slugify(characterName),
                          next = e.target.value;
                        setCharacterName(next);
                        if (!accessId || accessId === old)
                          setAccessId(slugify(next));
                      }}
                    />
                  </label>
                )}
                <label>
                  Acesso
                  <input
                    name="accessId"
                    required
                    minLength={3}
                    pattern="[A-Za-z0-9._-]+"
                    value={accessId}
                    onChange={(e) => setAccessId(e.target.value)}
                    placeholder="nome.do.personagem"
                  />
                </label>
                <label>
                  {accessMode === "create" ? "Senha inicial" : "Nova senha"}
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <button className="primary" disabled={busy}>
                  {accessMode === "create" ? "Criar acesso" : "Atualizar senha"}
                </button>
              </form>
              <div className="member-list">
                {members
                  .filter((m) => m.role === "player")
                  .map((m) => (
                    <p key={m.email}>
                      <span>
                        <strong>{visibleAccess(m.email)}</strong>
                        <small>jogador</small>
                      </span>
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              `Revogar o acesso de ${visibleAccess(m.email)}?`,
                            )
                          )
                            return;
                          const r = await db
                            .from("members")
                            .delete()
                            .eq("email", m.email);
                          if (r.error) report(r.error);
                          else await load().catch(report);
                        }}
                      >
                        Revogar
                      </button>
                    </p>
                  ))}
              </div>
            </details>
            <LiveRolls rolls={rolls} />
          </div>
        )}
        <div className="toolbar">
          <select
            aria-label="Selecionar ficha"
            value={active?.id || ""}
            onChange={(e) => {
              if (canLeave()) {
                setActive(rows.find((r) => r.id === e.target.value) || null);
                setDirty(false);
              }
            }}
          >
            <option value="">Selecione uma ficha</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.data.name}
              </option>
            ))}
          </select>
          <button disabled={busy} onClick={() => create()}>
            + Nova ficha
          </button>
          <label className="import">
            Importar
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                try {
                  if (f) {
                    if (f.size > 2000000) throw Error("Arquivo muito grande.");
                    await create(sheetSchema.parse(JSON.parse(await f.text())));
                  }
                } catch (err) {
                  report(err);
                }
                e.target.value = "";
              }}
            />
          </label>
          {active && (
            <>
              <button onClick={download}>Exportar</button>
              <button
                className="primary"
                disabled={busy || !dirty}
                onClick={save}
              >
                {busy ? "Salvando…" : dirty ? "Salvar alterações" : "Salvo"}
              </button>
            </>
          )}
        </div>
        {message && (
          <div className="notice" role="status">
            {message}
            <button aria-label="Fechar aviso" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}
        {active ? (
          <SheetEditor
            isMaster={role === "master"}
            catalog={catalog}
            sheet={active.data}
            onRoll={(r) => {
              void recordRoll(r);
            }}
            onChange={(data) => {
              setActive({ ...active, data });
              setDirty(true);
            }}
            onDelete={async () => {
              if (!confirm("Excluir esta ficha permanentemente?")) return;
              const r = await db
                .from("characters")
                .delete()
                .eq("id", active.id);
              if (r.error) report(r.error);
              else {
                setActive(null);
                setDirty(false);
                await load().catch(report);
              }
            }}
          />
        ) : (
          <section className="empty">
            <p className="eyebrow">ARQUIVO DE SOBREVIVENTES</p>
            <h1>Quem enfrenta o próximo dia?</h1>
            <p>Crie sua primeira ficha ou selecione um personagem acima.</p>
            <button
              className="primary"
              disabled={busy}
              onClick={() => create()}
            >
              Criar personagem
            </button>
          </section>
        )}
      </main>
    </>
  );
}
