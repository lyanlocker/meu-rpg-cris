-- PANI // W77-01 // PROTOCOLO CONTRAPROVA v1
-- Migração compatível: mantém as RPCs antigas até a publicação do novo frontend.

alter table public.pani_sepulcro_state
  add column if not exists protocol_version text,
  add column if not exists final_model text,
  add column if not exists ad06_layer_unlocked boolean not null default false,
  add column if not exists sequence08_visible boolean not null default false,
  add column if not exists auto_hint boolean not null default true,
  add column if not exists matrix_open boolean not null default false;

alter table public.pani_sepulcro_crew
  add column if not exists error_streak integer not null default 0,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists matrix_validated boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pani_sepulcro_state_final_model_check'
      and conrelid = 'public.pani_sepulcro_state'::regclass
  ) then
    alter table public.pani_sepulcro_state
      add constraint pani_sepulcro_state_final_model_check
      check (final_model is null or final_model = 'information_relation') not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'pani_sepulcro_crew_error_streak_check'
      and conrelid = 'public.pani_sepulcro_crew'::regclass
  ) then
    alter table public.pani_sepulcro_crew
      add constraint pani_sepulcro_crew_error_streak_check
      check (error_streak >= 0) not valid;
  end if;
end
$$;

alter table public.pani_sepulcro_state
  validate constraint pani_sepulcro_state_final_model_check;
alter table public.pani_sepulcro_crew
  validate constraint pani_sepulcro_crew_error_streak_check;

-- Executa a transição uma única vez. Reaplicar a migração não apaga progresso.
-- Arquivos, relatórios, credenciais, transmissões e mensagens globais não mudam.
with upgraded as (
  update public.pani_sepulcro_state
  set protocol_version = 'contraprova_v1',
      released = false,
      released_at = null,
      ops_solved = false,
      gen_solved = false,
      env_solved = false,
      med_solved = false,
      sec_solved = false,
      inv_solved = false,
      inv_available = false,
      semantic_tokens = '[]'::jsonb,
      first_glyph_value = null,
      reciprocity_established = false,
      external_signal = false,
      proximity_warning = false,
      movement_internal = false,
      alien_event_armed = false,
      final_model = null,
      ad06_layer_unlocked = false,
      sequence08_visible = false,
      matrix_open = false,
      updated_at = now()
  where session_id = 'W77-01'
    and protocol_version is distinct from 'contraprova_v1'
  returning session_id
)
update public.pani_sepulcro_crew c
set opened_at = null,
    attempts = 0,
    hint_level = 0,
    last_feedback = null,
    error_streak = 0,
    last_attempt_at = null,
    matrix_validated = false,
    updated_at = now()
where c.session_id in (select session_id from upgraded);

update public.pani_sepulcro_state
set protocol_version = 'contraprova_v1'
where protocol_version is null;

alter table public.pani_sepulcro_state
  alter column protocol_version set default 'contraprova_v1',
  alter column protocol_version set not null;

create or replace function public.pani_contraprova_signature(p_sector text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case p_sector
    when 'ops' then jsonb_build_object(
      'signature', 'MEIOS LOCAIS INSUFICIENTES / CONTROLE DE RETORNO EXTERNO',
      'physical', 'RECURSOS LOCAIS REAIS',
      'relation', 'RETORNO DEPENDE DE AUTORIZAÇÃO EXTERNA')
    when 'gen' then jsonb_build_object(
      'signature', 'OBJETO FÍSICO ESTÁVEL / REGISTRO DESCRITIVO INSTÁVEL',
      'physical', 'AMOSTRA E TECIDO ESTÁVEIS',
      'relation', 'DESCRIÇÃO / SEQUÊNCIA MUDA')
    when 'env' then jsonb_build_object(
      'signature', 'CAUSAS AMBIENTAIS VARIÁVEIS / DIREÇÃO RECORRENTE INVARIANTE',
      'physical', 'CONDIÇÕES AMBIENTAIS ALTERADAS',
      'relation', 'DIREÇÃO CONTINUA RECORRENTE')
    when 'med' then jsonb_build_object(
      'signature', 'EVENTO AINDA FUTURO / RESPOSTA JÁ REGISTRADA COMO ESPERADA',
      'physical', 'EVENTO AINDA NÃO OCORREU',
      'relation', 'RESPOSTA JÁ ESTAVA PREVISTA')
    when 'sec' then jsonb_build_object(
      'signature', 'TRAVESSIA NÃO REGISTRADA / PRESENÇA INTERNA CONFIRMADA',
      'physical', 'PORTAS SEM TRAVESSIA REGISTRADA',
      'relation', 'PRESENÇA / LOCALIZAÇÃO MUDA')
    else null
  end;
$$;

create or replace function public.pani_contraprova_hint_text(p_sector text, p_level integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_sector
    when 'ops' then case p_level
      when 1 then 'Separe capacidade de manobra de capacidade de retorno.'
      when 2 then 'NOT INSTALLED e NO LOCAL FLIGHT PLAN são ausências, não avarias.'
      when 3 then 'Siga a cadeia até a primeira autorização que não pertence à estação.'
      else 'Classifique propulsão e auxiliar como locais; RP-02 e plano como ausentes; recuperação e autoridade como externas.' end
    when 'gen' then case p_level
      when 1 then 'Compare a mesma amostra em suportes diferentes.'
      when 2 then 'Tecido, lâmina e espectro permanecem estáveis.'
      when 3 then 'A impressão física confirma que a divergência não pertence apenas ao monitor.'
      else 'Fixe amostra, lâmina e espectro; marque o resultado descritivo e teste ALTERAÇÃO DO REGISTRO.' end
    when 'env' then case p_level
      when 1 then 'Altere causas possíveis uma de cada vez e procure o que persiste.'
      when 2 then 'Rotação, luz e fluxo mudam a referência, mas não eliminam o vetor recorrente.'
      when 3 then 'A normalização compara a direção no referencial da estação, não no referencial da câmera.'
      else 'Escolha três testes ambientais válidos, normalize a referência e conclua DIREÇÃO INVARIANTE.' end
    when 'med' then case p_level
      when 1 then 'Ordene os registros pela metadata mais conservadora.'
      when 2 then 'A matriz prospectiva existe antes do lançamento e das observações clínicas.'
      when 3 then 'Diferencie risco genérico de respostas específicas já descritas.'
      else 'Use a ordem pré-missão, lançamento, clínica, deslocamento semântico e comparação; vincule cada previsão ao sintoma correspondente.' end
    when 'sec' then case p_level
      when 1 then 'Marque o primeiro instante em que a presença interna é confirmada.'
      when 2 then 'Compare esse instante com todas as trilhas de portas e fronteiras.'
      when 3 then 'Uma rota oculta ainda precisaria explicar a ausência total de travessia registrada.'
      else 'Inspecione T+00 a T+05, marque T+03, selecione NÃO ENCONTRADA e conclua PRESENÇA SEM TRAVESSIA.' end
    else case p_level
      when 1 then 'Cada assinatura possui um estado físico e uma relação que não fecha.'
      when 2 then 'Organize as dez metades em SUPORTE e REGRA / REGISTRO / RELAÇÃO.'
      when 3 then 'Teste qual modelo atravessa todos os suportes com zero contradições.'
      else 'A coluna comum é INFORMAÇÃO / RELAÇÃO. Isso prova o padrão, não traduz os Sinais.' end
  end;
$$;

create or replace function public.pani_contraprova_crew_state(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.crew_access%rowtype;
  cs public.pani_sepulcro_crew%rowtype;
  s public.pani_sepulcro_state%rowtype;
  signatures jsonb := '{}'::jsonb;
  parts jsonb := '{}'::jsonb;
  sig jsonb;
begin
  select * into c
  from public.crew_access
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  if c.crew_id is null then raise exception 'unauthorized'; end if;

  select * into cs from public.pani_sepulcro_crew
  where session_id = 'W77-01' and crew_id = c.crew_id;
  if cs.crew_id is null then raise exception 'sector_unassigned'; end if;

  select * into s from public.pani_sepulcro_state where session_id = 'W77-01';
  if not coalesce(s.released, false) then
    return jsonb_build_object('session_id', 'W77-01', 'sector', cs.sector, 'released', false);
  end if;

  if s.ops_solved then
    sig := public.pani_contraprova_signature('ops');
    signatures := signatures || jsonb_build_object('ops', sig->>'signature');
    parts := parts || jsonb_build_object('ops', sig - 'signature');
  end if;
  if s.gen_solved then
    sig := public.pani_contraprova_signature('gen');
    signatures := signatures || jsonb_build_object('gen', sig->>'signature');
    parts := parts || jsonb_build_object('gen', sig - 'signature');
  end if;
  if s.env_solved then
    sig := public.pani_contraprova_signature('env');
    signatures := signatures || jsonb_build_object('env', sig->>'signature');
    parts := parts || jsonb_build_object('env', sig - 'signature');
  end if;
  if s.med_solved then
    sig := public.pani_contraprova_signature('med');
    signatures := signatures || jsonb_build_object('med', sig->>'signature');
    parts := parts || jsonb_build_object('med', sig - 'signature');
  end if;
  if s.sec_solved then
    sig := public.pani_contraprova_signature('sec');
    signatures := signatures || jsonb_build_object('sec', sig->>'signature');
    parts := parts || jsonb_build_object('sec', sig - 'signature');
  end if;

  return jsonb_build_object(
    'session_id', s.session_id,
    'protocol_version', s.protocol_version,
    'sector', cs.sector,
    'released', true,
    'released_at', s.released_at,
    'ops_solved', s.ops_solved,
    'gen_solved', s.gen_solved,
    'env_solved', s.env_solved,
    'med_solved', s.med_solved,
    'sec_solved', s.sec_solved,
    'inv_solved', s.inv_solved,
    'solved_count', s.ops_solved::int + s.gen_solved::int + s.env_solved::int + s.med_solved::int + s.sec_solved::int,
    'inv_available', s.inv_available,
    'matrix_open', s.matrix_open,
    'matrix_validated', cs.matrix_validated,
    'final_model', s.final_model,
    'ad06_layer_unlocked', s.ad06_layer_unlocked,
    'sequence08_visible', s.sequence08_visible,
    'attempts', cs.attempts,
    'hint_level', cs.hint_level,
    'last_feedback', cs.last_feedback,
    'error_streak', cs.error_streak,
    'signatures', signatures,
    'signature_parts', parts,
    'glyph_semantics', 'UNRESOLVED',
    'alphabet_mapping', 'NOT_ATTEMPTED'
  );
end
$$;

create or replace function public.pani_contraprova_open(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare outv jsonb;
begin
  outv := public.pani_contraprova_crew_state(p_token);
  if not coalesce((outv->>'released')::boolean, false) then return outv; end if;
  update public.pani_sepulcro_crew c
  set opened_at = coalesce(c.opened_at, now()), updated_at = now()
  where c.session_id = 'W77-01'
    and c.crew_id = (
      select a.crew_id from public.crew_access a
      where a.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    );
  return public.pani_contraprova_crew_state(p_token);
end
$$;

create or replace function public.pani_contraprova_attempt(
  p_token text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.crew_access%rowtype;
  cs public.pani_sepulcro_crew%rowtype;
  s public.pani_sepulcro_state%rowtype;
  fb text;
  good boolean := false;
  attempts_now integer;
  streak_now integer;
  invalid_test boolean := false;
  assignment_count integer := 0;
  contradictions integer := 0;
  bins jsonb;
  route jsonb;
begin
  select * into c from public.crew_access
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  if c.crew_id is null then raise exception 'unauthorized'; end if;

  select * into cs from public.pani_sepulcro_crew
  where session_id = 'W77-01' and crew_id = c.crew_id;
  if cs.crew_id is null then raise exception 'sector_unassigned'; end if;

  select * into s from public.pani_sepulcro_state where session_id = 'W77-01';
  if not coalesce(s.released, false) then
    return jsonb_build_object('ok', false, 'locked', true, 'message', 'PROTOCOLO CONTRAPROVA NÃO LIBERADO.');
  end if;
  if cs.last_attempt_at is not null and now() - cs.last_attempt_at < interval '2 seconds' then
    return jsonb_build_object('ok', false, 'cooldown', true, 'available_in', 2, 'message', 'PANI // RECALIBRAÇÃO EM CURSO.');
  end if;

  update public.pani_sepulcro_crew
  set opened_at = coalesce(opened_at, now()), attempts = attempts + 1,
      last_attempt_at = now(), updated_at = now()
  where session_id = 'W77-01' and crew_id = c.crew_id
  returning attempts into attempts_now;

  if cs.sector = 'ops' then
    bins := coalesce(p_payload->'bins', '{}'::jsonb);
    route := coalesce(p_payload->'route', '[]'::jsonb);
    if jsonb_typeof(bins->'installed') <> 'array'
       or jsonb_array_length(coalesce(bins->'installed', '[]'::jsonb)) <> 2
       or not coalesce(bins->'installed', '[]'::jsonb) @> '["prop_main","prop_aux"]'::jsonb then
      fb := 'Os recursos locais precisam separar manobra de retorno autônomo.';
    elsif jsonb_array_length(coalesce(bins->'absent', '[]'::jsonb)) <> 2
       or not coalesce(bins->'absent', '[]'::jsonb) @> '["rp02","local_plan"]'::jsonb then
      fb := 'NOT INSTALLED e NO LOCAL FLIGHT PLAN são ausências, não avarias.';
    elsif jsonb_array_length(coalesce(bins->'external', '[]'::jsonb)) <> 2
       or not coalesce(bins->'external', '[]'::jsonb) @> '["recovery","authority"]'::jsonb then
      fb := 'Recuperação e autoridade pertencem a uma cadeia externa de controle.';
    elsif jsonb_array_length(route) <> 3
       or not route @> '["prop_main","prop_aux","recovery"]'::jsonb
       or route @> '["rp02"]'::jsonb then
      fb := 'O grafo ainda usa uma capacidade inexistente ou omite a dependência externa.';
    else good := true;
    end if;
  elsif cs.sector = 'gen' then
    if jsonb_array_length(coalesce(p_payload->'stable', '[]'::jsonb)) <> 3
       or not coalesce(p_payload->'stable', '[]'::jsonb) @> '["sample","slide","spectrum"]'::jsonb then
      fb := 'Fixe somente as camadas físicas e instrumentais que permanecem iguais.';
    elsif coalesce(p_payload->>'divergent', '') <> 'descriptive_record' then
      fb := 'A camada divergente é a descrição registrada, não a amostra.';
    elsif not coalesce((p_payload->>'physical_print')::boolean, false) then
      fb := 'A impressão física precisa entrar na contraprova para excluir falha exclusiva do monitor.';
    elsif coalesce(p_payload->>'hypothesis', '') <> 'record_change' then
      fb := 'A hipótese escolhida ainda contradiz a estabilidade do objeto e do espectro.';
    else good := true;
    end if;
  elsif cs.sector = 'env' then
    select exists (
      select 1 from jsonb_array_elements_text(coalesce(p_payload->'tests', '[]'::jsonb)) t(value)
      where value not in ('light','airflow','rotation','humidity','crt')
    ) into invalid_test;
    if jsonb_array_length(coalesce(p_payload->'tests', '[]'::jsonb)) <> 3 or invalid_test then
      fb := 'Selecione exatamente três intervenções que alterem variáveis ambientais reais.';
    elsif not coalesce((p_payload->>'normalized')::boolean, false) then
      fb := 'As referências ainda não foram normalizadas no eixo comum da estação.';
    elsif coalesce(p_payload->>'conclusion', '') <> 'direction_invariant' then
      fb := 'As causas mudam entre testes; a direção é o componente que persiste.';
    else good := true;
    end if;
  elsif cs.sector = 'med' then
    if coalesce(p_payload->'order', '[]'::jsonb) <> '["premission","launch","clinical","semantic","comparison"]'::jsonb then
      fb := 'A metadata ainda não coloca o arquivo pré-missão antes do lançamento e das observações.';
    elsif coalesce(p_payload#>>'{links,thermal}', '') <> 'thermal_drop'
       or coalesce(p_payload#>>'{links,rem}', '') <> 'rem_sync'
       or coalesce(p_payload#>>'{links,pain}', '') <> 'pain_without_lesion'
       or coalesce(p_payload#>>'{links,fixation}', '') <> 'cognitive_fixation' then
      fb := 'Cada previsão precisa ser ligada à resposta clínica específica que antecipa.';
    elsif coalesce(p_payload->>'distinction', '') <> 'specific_expected' then
      fb := 'O vocabulário prévio descreve respostas esperadas específicas, não risco genérico.';
    else good := true;
    end if;
  elsif cs.sector = 'sec' then
    if not coalesce(p_payload->'inspected', '[]'::jsonb) @> '[0,1,2,3,4,5]'::jsonb then
      fb := 'Reproduza todas as janelas T+00 a T+05 antes de fechar a hipótese.';
    elsif coalesce(p_payload->>'presence', '') <> 't03' then
      fb := 'A primeira confirmação de movimento interno ocorre em T+03.';
    elsif coalesce(p_payload->>'crossing', '') <> 'none' then
      fb := 'Nenhuma das rotas possui a travessia que a presença interna exigiria.';
    elsif coalesce(p_payload->>'conclusion', '') <> 'presence_without_traversal' then
      fb := 'Os logs sustentam presença confirmada sem travessia correspondente.';
    else good := true;
    end if;
  elsif cs.sector = 'inv' then
    if not (s.ops_solved and s.gen_solved and s.env_solved and s.med_solved and s.sec_solved) and not s.matrix_open then
      fb := 'A matriz final exige cinco assinaturas publicadas ou liberação manual do Mestre.';
    elsif coalesce(p_payload->>'stage', '') = 'matrix' then
      select count(*) into assignment_count
      from jsonb_object_keys(coalesce(p_payload->'assignments', '{}'::jsonb));
      if assignment_count <> 10
         or p_payload#>>'{assignments,ops:physical}' <> 'physical'
         or p_payload#>>'{assignments,gen:physical}' <> 'physical'
         or p_payload#>>'{assignments,env:physical}' <> 'physical'
         or p_payload#>>'{assignments,med:physical}' <> 'physical'
         or p_payload#>>'{assignments,sec:physical}' <> 'physical'
         or p_payload#>>'{assignments,ops:relation}' <> 'relation'
         or p_payload#>>'{assignments,gen:relation}' <> 'relation'
         or p_payload#>>'{assignments,env:relation}' <> 'relation'
         or p_payload#>>'{assignments,med:relation}' <> 'relation'
         or p_payload#>>'{assignments,sec:relation}' <> 'relation' then
        fb := 'A matriz mistura suporte físico com regra, registro ou relação.';
      else
        update public.pani_sepulcro_crew
        set matrix_validated = true, error_streak = 0,
            last_feedback = 'MATRIZ COERENTE // COLUNA AUSENTE DISPONÍVEL', updated_at = now()
        where session_id = 'W77-01' and crew_id = c.crew_id;
        return jsonb_build_object('ok', true, 'sector', 'inv', 'matrix_validated', true,
          'message', 'MATRIZ COERENTE // TESTE UM MODELO COMUM', 'attempts', attempts_now);
      end if;
    elsif coalesce(p_payload->>'stage', '') = 'model' then
      if not cs.matrix_validated then
        fb := 'Valide primeiro a separação entre suporte físico e relação.';
      elsif coalesce(p_payload->>'model', '') <> 'relation' then
        contradictions := case coalesce(p_payload->>'model', '')
          when 'sensors' then 3 when 'independent' then 4
          when 'mechanical' then 4 when 'biological' then 4 else 5 end;
        fb := format('O modelo mantém %s contradições sem explicação.', contradictions);
      else
        update public.pani_sepulcro_state
        set inv_available = true, inv_solved = true,
            final_model = 'information_relation', ad06_layer_unlocked = true,
            semantic_tokens = '[]'::jsonb, first_glyph_value = null,
            reciprocity_established = false, updated_at = now()
        where session_id = 'W77-01';
        update public.pani_sepulcro_crew
        set error_streak = 0,
            last_feedback = 'HIPÓTESE ESTABILIZADA // SEMÂNTICA NÃO RESOLVIDA', updated_at = now()
        where session_id = 'W77-01' and crew_id = c.crew_id;
        insert into public.event_log(session_id, actor, event_type, detail)
        values ('W77-02', c.display_name, 'contraprova_resolved', 'information / relation; glyph semantics unresolved');
        return jsonb_build_object('ok', true, 'sector', 'inv', 'resolved', true,
          'message', 'CINCO SUPORTES // UMA CLASSE DE CONTRADIÇÃO',
          'model', 'INFORMATION_RELATION', 'semantics', 'UNRESOLVED',
          'alphabet', 'NOT_ATTEMPTED', 'attempts', attempts_now);
      end if;
    else fb := 'A etapa de correlação solicitada não é válida.';
    end if;
  else
    fb := 'Módulo de contraprova não reconhecido para esta credencial.';
  end if;

  if not good then
    update public.pani_sepulcro_crew
    set error_streak = error_streak + 1, last_feedback = fb, updated_at = now()
    where session_id = 'W77-01' and crew_id = c.crew_id
    returning error_streak into streak_now;
    return jsonb_build_object('ok', false, 'sector', cs.sector, 'feedback', fb,
      'attempts', attempts_now, 'contradiction_count', greatest(contradictions, 1),
      'error_streak', streak_now, 'hint_offer', s.auto_hint and streak_now >= 3);
  end if;

  update public.pani_sepulcro_state
  set ops_solved = ops_solved or cs.sector = 'ops',
      gen_solved = gen_solved or cs.sector = 'gen',
      env_solved = env_solved or cs.sector = 'env',
      med_solved = med_solved or cs.sector = 'med',
      sec_solved = sec_solved or cs.sector = 'sec',
      updated_at = now()
  where session_id = 'W77-01';
  update public.pani_sepulcro_state
  set inv_available = matrix_open or (ops_solved and gen_solved and env_solved and med_solved and sec_solved),
      updated_at = now()
  where session_id = 'W77-01';
  update public.pani_sepulcro_crew
  set error_streak = 0,
      last_feedback = 'CONTRAPROVA ESTABILIZADA // ASSINATURA PUBLICADA PARA INV', updated_at = now()
  where session_id = 'W77-01' and crew_id = c.crew_id;
  insert into public.event_log(session_id, actor, event_type, detail)
  values ('W77-02', c.display_name, 'contraprova_signature_published', cs.sector);
  return jsonb_build_object('ok', true, 'sector', cs.sector,
    'message', 'CONTRAPROVA ESTABILIZADA // ASSINATURA PUBLICADA',
    'signature', public.pani_contraprova_signature(cs.sector)->>'signature',
    'attempts', attempts_now);
end
$$;

create or replace function public.pani_contraprova_hint(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.crew_access%rowtype;
  cs public.pani_sepulcro_crew%rowtype;
  s public.pani_sepulcro_state%rowtype;
  lvl integer;
  hint text;
begin
  select * into c from public.crew_access
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  if c.crew_id is null then raise exception 'unauthorized'; end if;
  select * into cs from public.pani_sepulcro_crew
  where session_id = 'W77-01' and crew_id = c.crew_id;
  if cs.crew_id is null then raise exception 'sector_unassigned'; end if;
  select * into s from public.pani_sepulcro_state where session_id = 'W77-01';
  if not coalesce(s.released, false) then
    return jsonb_build_object('ok', false, 'locked', true, 'message', 'PROTOCOLO CONTRAPROVA NÃO LIBERADO.');
  end if;

  lvl := least(4, cs.hint_level + 1);
  hint := public.pani_contraprova_hint_text(cs.sector, lvl);
  update public.pani_sepulcro_crew
  set opened_at = coalesce(opened_at, now()), hint_level = lvl,
      last_feedback = hint, updated_at = now()
  where session_id = 'W77-01' and crew_id = c.crew_id;

  if lvl < 4 then
    return jsonb_build_object('ok', true, 'level', lvl, 'hint', hint);
  end if;
  if cs.sector = 'inv' and not (s.ops_solved and s.gen_solved and s.env_solved and s.med_solved and s.sec_solved) and not s.matrix_open then
    return jsonb_build_object('ok', true, 'level', lvl, 'hint', hint,
      'completed', false, 'message', 'A conclusão aguarda as assinaturas restantes.');
  end if;

  if cs.sector = 'inv' then
    update public.pani_sepulcro_state
    set inv_available = true, inv_solved = true,
        final_model = 'information_relation', ad06_layer_unlocked = true,
        semantic_tokens = '[]'::jsonb, first_glyph_value = null,
        reciprocity_established = false, updated_at = now()
    where session_id = 'W77-01';
    update public.pani_sepulcro_crew set matrix_validated = true
    where session_id = 'W77-01' and crew_id = c.crew_id;
  else
    update public.pani_sepulcro_state
    set ops_solved = ops_solved or cs.sector = 'ops',
        gen_solved = gen_solved or cs.sector = 'gen',
        env_solved = env_solved or cs.sector = 'env',
        med_solved = med_solved or cs.sector = 'med',
        sec_solved = sec_solved or cs.sector = 'sec', updated_at = now()
    where session_id = 'W77-01';
    update public.pani_sepulcro_state
    set inv_available = matrix_open or (ops_solved and gen_solved and env_solved and med_solved and sec_solved)
    where session_id = 'W77-01';
  end if;
  insert into public.event_log(session_id, actor, event_type, detail)
  values ('W77-02', c.display_name, 'contraprova_assisted_completion', cs.sector);
  return jsonb_build_object('ok', true, 'level', lvl, 'hint', hint,
    'completed', true, 'sector', cs.sector,
    'message', 'MÓDULO COMPLETADO COM ASSISTÊNCIA PANI');
end
$$;

create or replace function public.pani_contraprova_master_state(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.pani_sepulcro_state%rowtype;
  crew jsonb;
begin
  if not public.pani_master_valid(p_pin) then raise exception 'unauthorized'; end if;
  select * into s from public.pani_sepulcro_state where session_id = 'W77-01';
  select coalesce(jsonb_agg(jsonb_build_object(
    'crew_id', pc.crew_id, 'display_name', ca.display_name, 'sector', pc.sector,
    'opened_at', pc.opened_at, 'attempts', pc.attempts,
    'hint_level', pc.hint_level, 'last_feedback', pc.last_feedback,
    'error_streak', pc.error_streak, 'matrix_validated', pc.matrix_validated
  ) order by pc.sector), '[]'::jsonb)
  into crew
  from public.pani_sepulcro_crew pc
  join public.crew_access ca using (crew_id)
  where pc.session_id = 'W77-01';
  return to_jsonb(s) || jsonb_build_object(
    'crew', crew,
    'solved_count', s.ops_solved::int + s.gen_solved::int + s.env_solved::int + s.med_solved::int + s.sec_solved::int,
    'glyph_semantics', 'UNRESOLVED', 'alphabet_mapping', 'NOT_ATTEMPTED');
end
$$;

create or replace function public.pani_contraprova_master_action(
  p_pin text,
  p_action text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target text := lower(coalesce(p_payload->>'sector', ''));
  lvl integer;
  hint text;
begin
  if not public.pani_master_valid(p_pin) then raise exception 'unauthorized'; end if;

  if p_action = 'release' then
    update public.pani_sepulcro_state
    set released = true, released_at = now(), protocol_version = 'contraprova_v1',
        semantic_tokens = '[]'::jsonb, first_glyph_value = null,
        reciprocity_established = false, updated_at = now()
    where session_id = 'W77-01';
  elsif p_action = 'hide' then
    update public.pani_sepulcro_state
    set released = false, released_at = null, updated_at = now()
    where session_id = 'W77-01';
  elsif p_action = 'reset' then
    update public.pani_sepulcro_state
    set released = false, released_at = null,
        ops_solved = false, gen_solved = false, env_solved = false,
        med_solved = false, sec_solved = false, inv_solved = false,
        inv_available = false, semantic_tokens = '[]'::jsonb,
        first_glyph_value = null, reciprocity_established = false,
        final_model = null, ad06_layer_unlocked = false,
        sequence08_visible = false, matrix_open = false, updated_at = now()
    where session_id = 'W77-01';
    update public.pani_sepulcro_crew
    set opened_at = null, attempts = 0, hint_level = 0,
        last_feedback = null, error_streak = 0, last_attempt_at = null,
        matrix_validated = false, updated_at = now()
    where session_id = 'W77-01';
  elsif p_action = 'solve' then
    if target not in ('ops','gen','env','med','sec','inv') then raise exception 'invalid_sector'; end if;
    if target = 'inv' then
      update public.pani_sepulcro_state
      set inv_available = true, inv_solved = true,
          final_model = 'information_relation', ad06_layer_unlocked = true,
          semantic_tokens = '[]'::jsonb, first_glyph_value = null,
          reciprocity_established = false, updated_at = now()
      where session_id = 'W77-01';
      update public.pani_sepulcro_crew set matrix_validated = true, updated_at = now()
      where session_id = 'W77-01' and sector = 'inv';
    else
      update public.pani_sepulcro_state
      set ops_solved = ops_solved or target = 'ops',
          gen_solved = gen_solved or target = 'gen',
          env_solved = env_solved or target = 'env',
          med_solved = med_solved or target = 'med',
          sec_solved = sec_solved or target = 'sec', updated_at = now()
      where session_id = 'W77-01';
      update public.pani_sepulcro_state
      set inv_available = matrix_open or (ops_solved and gen_solved and env_solved and med_solved and sec_solved)
      where session_id = 'W77-01';
    end if;
  elsif p_action = 'hint' then
    if target not in ('ops','gen','env','med','sec','inv') then raise exception 'invalid_sector'; end if;
    select least(4, hint_level + 1) into lvl
    from public.pani_sepulcro_crew where session_id = 'W77-01' and sector = target;
    hint := public.pani_contraprova_hint_text(target, coalesce(lvl, 1));
    update public.pani_sepulcro_crew
    set hint_level = coalesce(lvl, 1), last_feedback = hint, updated_at = now()
    where session_id = 'W77-01' and sector = target;
  elsif p_action = 'auto_hint' then
    update public.pani_sepulcro_state
    set auto_hint = coalesce((p_payload->>'enabled')::boolean, true), updated_at = now()
    where session_id = 'W77-01';
  elsif p_action = 'matrix' then
    update public.pani_sepulcro_state
    set matrix_open = coalesce((p_payload->>'open')::boolean, false), updated_at = now()
    where session_id = 'W77-01';
    update public.pani_sepulcro_state
    set inv_available = matrix_open or (ops_solved and gen_solved and env_solved and med_solved and sec_solved)
    where session_id = 'W77-01';
  elsif p_action = 'sequence' then
    update public.pani_sepulcro_state
    set sequence08_visible = coalesce((p_payload->>'visible')::boolean, false), updated_at = now()
    where session_id = 'W77-01';
  elsif p_action = 'arm_event' then
    -- Ferramenta narrativa deliberadamente independente do enigma.
    update public.pani_sepulcro_state
    set external_signal = true, proximity_warning = true,
        movement_internal = true, alien_event_armed = true, updated_at = now()
    where session_id = 'W77-01';
    update public.game_state
    set alert_text = 'PANI // PROXIMITY WARNING // MOVEMENT INTERNAL DETECTED',
        alert_severity = 'critical', updated_at = now()
    where id = 'W77-02';
  elsif p_action = 'disarm_event' then
    update public.pani_sepulcro_state
    set external_signal = false, proximity_warning = false,
        movement_internal = false, alien_event_armed = false, updated_at = now()
    where session_id = 'W77-01';
    update public.game_state
    set alert_text = case when alert_text = 'PANI // PROXIMITY WARNING // MOVEMENT INTERNAL DETECTED' then null else alert_text end,
        alert_severity = case when alert_text = 'PANI // PROXIMITY WARNING // MOVEMENT INTERNAL DETECTED' then 'info' else alert_severity end,
        updated_at = now()
    where id = 'W77-02';
  else
    raise exception 'invalid_action';
  end if;

  insert into public.event_log(session_id, actor, event_type, detail)
  values ('W77-02', 'MASTER', 'contraprova_master_action', p_action || case when target <> '' then ':' || target else '' end);
  return public.pani_contraprova_master_state(p_pin);
end
$$;

revoke execute on function public.pani_contraprova_signature(text) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_hint_text(text, integer) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_crew_state(text) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_open(text) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_attempt(text, jsonb) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_hint(text) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_master_state(text) from public, anon, authenticated;
revoke execute on function public.pani_contraprova_master_action(text, text, jsonb) from public, anon, authenticated;

grant execute on function public.pani_contraprova_crew_state(text) to anon, authenticated, service_role;
grant execute on function public.pani_contraprova_open(text) to anon, authenticated, service_role;
grant execute on function public.pani_contraprova_attempt(text, jsonb) to anon, authenticated, service_role;
grant execute on function public.pani_contraprova_hint(text) to anon, authenticated, service_role;
grant execute on function public.pani_contraprova_master_state(text) to anon, authenticated, service_role;
grant execute on function public.pani_contraprova_master_action(text, text, jsonb) to anon, authenticated, service_role;

comment on function public.pani_contraprova_attempt(text, jsonb) is
  'Valida os cinco módulos forenses e a matriz INV sem tradução de glifos ou reciprocidade.';
comment on function public.pani_contraprova_master_action(text, text, jsonb) is
  'Controles do Mestre para Contraprova; arm_event é uma ferramenta narrativa independente.';

notify pgrst, 'reload schema';
