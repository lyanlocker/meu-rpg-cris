#!/usr/bin/env bash
set -euo pipefail

rm -rf public
mkdir -p public
cp pani-w77/style.css pani-w77/core.js pani-w77/views.js pani-w77/runtime.js pani-w77/index.html public/

python3 - <<'PY'
from pathlib import Path
import re

index_path = Path('public/index.html')
index = index_path.read_text(encoding='utf-8')
for name in ('style.css', 'core.js', 'views.js', 'runtime.js'):
    index = re.sub(
        rf'https://cdn\.jsdelivr\.net/gh/lyanlocker/meu-rpg-cris@[^/]+/pani-w77/{re.escape(name)}',
        f'./{name}',
        index,
    )
index = re.sub(r''' onerror="this\.onerror=null;this\.(?:href|src)='[^']+'"''', '', index)
if 'name="pani-host"' not in index:
    index = index.replace('</head>', '<meta name="pani-host" content="render-static-v1"></head>', 1)
assert './style.css' in index
assert './core.js' in index
assert './views.js' in index
assert './runtime.js' in index
assert 'cdn.jsdelivr.net' not in index
assert 'fastly.jsdelivr.net' not in index
index_path.write_text(index, encoding='utf-8')

core_path = Path('public/core.js')
core = core_path.read_text(encoding='utf-8')
bad_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im52d3pjbmZvbmhwaWxueG1vcGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTI3NTcsImV4cCI6MjEwMjMyODc1N30.5FBDbk8J1uN8JLLpKMk_Hubw6K7kbQQiulIamwm9Vso'
good_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3pjbmZvbmhwaWxueG1vcGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTI3NTcsImV4cCI6MjEwMjMyODc1N30.5FBDbk8J1uN8JLLpKMk_Hubw6K7kbQQiulIamwm9Vso'
core = core.replace(bad_key, good_key)
assert good_key in core
assert bad_key not in core
core_path.write_text(core, encoding='utf-8')

runtime_path = Path('public/runtime.js')
runtime = runtime_path.read_text(encoding='utf-8')
old_inputs = "$('#energy').value=state.energy_capacity;$('#occupancy').value=state.occupancy;"
new_inputs = "if(document.activeElement!==$('#energy'))$('#energy').value=state.energy_capacity;if(document.activeElement!==$('#occupancy'))$('#occupancy').value=state.occupancy;"
runtime = runtime.replace(old_inputs, new_inputs)
old_login = "}catch{toast('PIN inválido ou backend indisponível.',true);conn('MASTER // ACESSO NEGADO',false)}finally"
new_login = "}catch(e){let em=String(e?.message||'');let badPin=em.includes('unauthorized');toast(badPin?'PIN inválido.':'Falha ao conectar com o backend.',true);conn(badPin?'MASTER // ACESSO NEGADO':'MASTER // BACKEND INDISPONÍVEL',false)}finally"
runtime = runtime.replace(old_login, new_login)
assert new_inputs in runtime
assert new_login in runtime
runtime_path.write_text(runtime, encoding='utf-8')

for filename in ('index.html','style.css','core.js','views.js','runtime.js'):
    p = Path('public') / filename
    assert p.exists() and p.stat().st_size > 100
print('PANI build audit OK')
PY

node --check public/core.js
node --check public/views.js
node --check public/runtime.js
