import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
const domain = "players.sistema-onix.app";
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 48);
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Sessão ausente." }, 401);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);
    if (userError || !user?.email)
      return reply({ error: "Sessão inválida." }, 401);
    const { data: member } = await admin
      .from("members")
      .select("role")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (member?.role !== "master")
      return reply({ error: "Somente o mestre pode gerenciar acessos." }, 403);
    const body = await req.json(),
      accessId = slugify(String(body.accessId || "")),
      password = String(body.password || ""),
      characterName = String(body.characterName || "").trim();
    if (accessId.length < 3 || password.length < 8)
      return reply(
        {
          error: "Use um acesso com 3 caracteres e uma senha com pelo menos 8.",
        },
        400,
      );
    const email = `${accessId}@${domain}`;
    if (body.action === "create") {
      if (!characterName)
        return reply({ error: "Informe o nome do personagem." }, 400);
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { character_name: characterName, access_id: accessId },
      });
      if (created.error) return reply({ error: created.error.message }, 400);
      const memberInsert = await admin
        .from("members")
        .insert({ email, role: "player" });
      if (memberInsert.error) {
        await admin.auth.admin.deleteUser(created.data.user.id);
        return reply({ error: memberInsert.error.message }, 400);
      }
      return reply({ ok: true, accessId });
    }
    if (body.action === "reset") {
      const listed = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const target = listed.data.users.find(
        (item) => item.email?.toLowerCase() === email,
      );
      if (!target) return reply({ error: "Acesso não encontrado." }, 404);
      const updated = await admin.auth.admin.updateUserById(target.id, {
        password,
      });
      if (updated.error) return reply({ error: updated.error.message }, 400);
      return reply({ ok: true, accessId });
    }
    return reply({ error: "Ação inválida." }, 400);
  } catch (error) {
    return reply(
      { error: error instanceof Error ? error.message : "Falha inesperada." },
      500,
    );
  }
});
