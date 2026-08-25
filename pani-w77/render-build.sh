#!/usr/bin/env bash
set -euo pipefail

rm -rf public
mkdir -p public
cp pani-w77/style.css pani-w77/files.css pani-w77/mission.css pani-w77/assistance.css pani-w77/corruption.css pani-w77/core.js pani-w77/views.js pani-w77/files.js pani-w77/runtime.js pani-w77/mission.js pani-w77/mission-runtime.js pani-w77/assistance.js pani-w77/corruption.js pani-w77/index.html pani-w77/layout-qa.html public/
cp pani-w77/retired-event.js public/containment.js
cp pani-w77/retired-event.js public/sepulcro.js
cp pani-w77/retired-event.css public/containment.css
cp pani-w77/retired-event.css public/sepulcro.css
cp pani-w77/retired-event.html public/containment-qa.html
cp pani-w77/retired-event.html public/containment-mobile-qa.html

python3 - <<'PY'
from pathlib import Path

index=Path('public/index.html').read_text(encoding='utf-8')
for asset in ('style.css','files.css','mission.css','assistance.css','corruption.css','core.js','views.js','files.js','runtime.js','mission.js','mission-runtime.js','assistance.js','corruption.js'):
    assert f'./{asset}' in index,asset
for removed in ('sepulcro.css','sepulcro.js','containment.css','containment.js','containment-qa','containment-mobile'):
    assert removed not in index,removed
for removed_control in ('seprelease','sepautohint','sepmatrix','sepsequence','separm','sepreset','msep','msepstate','progress'):
    assert f'id="{removed_control}"' not in index,removed_control
assert 'render-static-v10-corrupted-update' in index
assert 'pani-glyph-rail' in index and 'UPDATE CHANNEL' in index and 'INTERFACE INTEGRITY' in index

core=Path('public/core.js').read_text(encoding='utf-8')
views=Path('public/views.js').read_text(encoding='utf-8')
runtime=Path('public/runtime.js').read_text(encoding='utf-8')
joined='\n'.join((core,views,runtime))
for removed in ('sepState','sepMasterState','sepReleased','sepulcro','containmentState','containmentPage','containmentCrewRefresh','containmentMasterRefresh','pani_contraprova','pani_containment'):
    assert removed not in joined,removed
for required in ('STATION_ID','LEGACY_SECTOR','CREW_DIRECTORY',"['aliya','Aliya Kessler']",'INVESTIGAÇÃO PARANORMAL & COORDENAÇÃO'):
    assert required in core,required
assert "['alice','Alice Velvet']" in core
for required in ('ALIYA_PROFILE','Bióloga marinha','águas profundas','Alef Dena','Investigação Paranormal e Coordenação','stationProfile'):
    assert required in views,required
for required in ('backendHealth',"toast('PIN inválido.'",'MASTER // BACKEND INDISPONÍVEL','pani_master_action','pani_master_logs'):
    assert required in runtime,required

corruption_css=Path('public/corruption.css').read_text(encoding='utf-8')
corruption_js=Path('public/corruption.js').read_text(encoding='utf-8')
for required in ('pani-scanlines','glitch-title','dash-hero','station-sector','pani-console','@media(max-width:520px)','@media(prefers-reduced-motion:reduce)',':focus-visible'):
    assert required in corruption_css,required
for required in ('PANI_ALPHA_PATHS','pani-glyph','prefers-reduced-motion','pani-glitch-pulse','pani:render'):
    assert required in corruption_js,required

files=Path('public/files.js').read_text(encoding='utf-8')
for required in ('f.is_new&&f.can_open','function pfMime(file)','pani_unlock_file','INSERIR CHAVE','new File([file],file.name,{type:mime})'):
    assert required in files,required
mission=Path('public/mission.js').read_text(encoding='utf-8')
mission_runtime=Path('public/mission-runtime.js').read_text(encoding='utf-8')
for required in ('pani_submit_report','pani_crew_redeem_credential','pani_master_access_code_upsert','missionTransmissionGlitch','RELATÓRIO DO DIA'):
    assert required in mission,required
assert 'data-v="report"' in mission_runtime and "view!=='cred'&&view!=='report'" in mission_runtime
assist=Path('public/assistance.js').read_text(encoding='utf-8')
for required in ('pani_assistance_submit','pani_assistance_reply','pani_crew_assistance','pani_master_assistance','CAIXA DE SOLICITAÇÕES'):
    assert required in assist,required

for source in ('core.js','views.js','transmission.js','files.js','mission.js'):
    path=Path('pani-w77',source) if source=='transmission.js' else Path('public',source)
    text=path.read_text(encoding='utf-8')
    assert 'Viego' not in text and 'viego' not in text,source

for filename in ('index.html','style.css','files.css','mission.css','assistance.css','corruption.css','core.js','views.js','files.js','runtime.js','mission.js','mission-runtime.js','assistance.js','corruption.js'):
    path=Path('public')/filename
    assert path.exists() and path.stat().st_size>100,filename
qa=Path('public/layout-qa.html').read_text(encoding='utf-8')
assert 'stationSectorPage()' in qa and 'PANI_ALPHA_PATHS' not in qa and 'alphabet-paths.js' in qa
assert 'containment' not in qa.lower() and 'sepulcro' not in qa.lower() and 'contraprova' not in qa.lower()
for retired in ('sepulcro.js','containment.js'):
    text=(Path('public')/retired).read_text(encoding='utf-8')
    assert 'PANI_RETIRED_EVENT_ASSET' in text and 'pani_containment' not in text and 'pani_contraprova' not in text,retired
for retired in ('sepulcro.css','containment.css'):
    assert 'aposentados' in (Path('public')/retired).read_text(encoding='utf-8'),retired
for retired in ('containment-qa.html','containment-mobile-qa.html'):
    assert 'MÓDULO CONCLUÍDO' in (Path('public')/retired).read_text(encoding='utf-8'),retired
print('PANI build audit OK // EVENTOS CONCLUIDOS REMOVIDOS // CORRUPTED UPDATE UI')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js
node --check public/corruption.js

if [[ -n "${PANI_MASTER_PIN:-}" ]]; then
  export PANI_STORAGE_QA
  PANI_STORAGE_QA="$(curl --fail --silent --show-error --max-time 20 -H 'Content-Type: application/json' --data "{\"action\":\"self_test\",\"pin\":\"${PANI_MASTER_PIN}\"}" 'https://nvwzcnfonhpilnxmopgi.supabase.co/functions/v1/pani-files')"
  python3 - <<'PY'
import json, os
r=json.loads(os.environ['PANI_STORAGE_QA'])
assert r.get('ok') is True, r
assert r.get('put_status') in (200,201), r
assert r.get('read_status') == 200, r
assert r.get('content_ok') is True, r
print('PANI private Storage QA OK')
PY
fi

bash pani-w77/render-transmission.sh
