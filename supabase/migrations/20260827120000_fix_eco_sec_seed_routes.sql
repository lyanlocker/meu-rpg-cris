-- Cinco Âncoras // todas as rotas SEC precisam formar caminhos válidos no grafo IFF-Ø.
-- Seeds 5, 6, 7, 8 e 10 continham ao menos uma aresta inexistente e podiam tornar
-- o rastreamento de Christian impossível ou impedir a validação da rota pelo Mestre.

update pani_private.eco_seed_library
set sec_route=case seed_id
  when 5 then array['INV','MED','OPS','HUB','SEC','GEN']::text[]
  when 6 then array['SEC','INV','MED','OPS','HUB','GEN']::text[]
  when 7 then array['OPS','MED','INV','SEC','HUB','GEN']::text[]
  when 8 then array['GEN','HUB','OPS','SEC','INV','MED']::text[]
  when 10 then array['INV','GEN','SEC','HUB','MED','OPS']::text[]
  else sec_route
end
where seed_id in(5,6,7,8,10);

do $validation$
declare invalid_edges integer;
begin
  select count(*)
  into invalid_edges
  from pani_private.eco_seed_library seed,
       generate_series(1,cardinality(seed.sec_route)-1) edge_index
  where pani_private.eco_edge(
    seed.sec_route[edge_index],
    seed.sec_route[edge_index+1]
  ) is null;

  if invalid_edges<>0 then
    raise exception 'eco_sec_seed_routes_invalid: %',invalid_edges;
  end if;
end
$validation$;
