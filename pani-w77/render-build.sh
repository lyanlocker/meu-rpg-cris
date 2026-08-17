#!/usr/bin/env bash
set -euo pipefail

rm -rf public
mkdir -p public
cp pani-w77/style.css pani-w77/files.css pani-w77/mission.css pani-w77/assistance.css pani-w77/core.js pani-w77/views.js pani-w77/files.js pani-w77/runtime.js pani-w77/mission.js pani-w77/mission-runtime.js pani-w77/assistance.js pani-w77/index.html public/

python3 - <<'PY'
from pathlib import Path
import re

index_path=Path('public/index.html');index=index_path.read_text(encoding='utf-8')
for name in ('style.css','core.js','views.js','runtime.js'):
 index=re.sub(rf'https://cdn\.jsdelivr\.net/gh/lyanlocker/meu-rpg-cris@[^/]+/pani-w77/{re.escape(name)}',f'./{name}',index)
index=re.sub(r''' onerror="this\.onerror=null;this\.(?:href|src)='[^']+'"''','',index)
if './files.css' not in index:index=index.replace('</head>','<link rel="stylesheet" href="./files.css"></head>',1)
if './mission.css' not in index:index=index.replace('</head>','<link rel="stylesheet" href="./mission.css"></head>',1)
if './assistance.css' not in index:index=index.replace('</head>','<link rel="stylesheet" href="./assistance.css"></head>',1)
if './files.js' not in index:index=index.replace('<script src="./runtime.js"></script>','<script src="./files.js"></script><script src="./runtime.js"></script>',1)
if './mission.js' not in index:index=index.replace('<script src="./runtime.js"></script>','<script src="./runtime.js"></script><script src="./mission.js"></script><script src="./mission-runtime.js"></script>',1)
if './assistance.js' not in index:index=index.replace('<script src="./mission-runtime.js"></script>','<script src="./mission-runtime.js"></script><script src="./assistance.js"></script>',1)
if 'name="pani-host"' not in index:index=index.replace('</head>','<meta name="pani-host" content="render-static-v6-private-assistance"></head>',1)
for asset in ('./style.css','./files.css','./mission.css','./assistance.css','./core.js','./views.js','./files.js','./runtime.js','./mission.js','./mission-runtime.js','./assistance.js'):assert asset in index,asset
assert index.index('./runtime.js') < index.index('./mission.js') < index.index('./mission-runtime.js') < index.index('./assistance.js')
assert 'cdn.jsdelivr.net' not in index and 'fastly.jsdelivr.net' not in index
index_path.write_text(index,encoding='utf-8')

core_path=Path('public/core.js');core=core_path.read_text(encoding='utf-8')
bad_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im52d3pjbmZvbmhwaWxueG1vcGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTI3NTcsImV4cCI6MjEwMjMyODc1N30.5FBDbk8J1uN8JLLpKMk_Hubw6K7kbQQiulIamwm9Vso'
good_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3pjbmZvbmhwaWxueG1vcGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTI3NTcsImV4cCI6MjEwMjMyODc1N30.5FBDbk8J1uN8JLLpKMk_Hubw6K7kbQQiulIamwm9Vso'
core=core.replace(bad_key,good_key);assert good_key in core and bad_key not in core;core_path.write_text(core,encoding='utf-8')

runtime_path=Path('public/runtime.js');runtime=runtime_path.read_text(encoding='utf-8')
assert 'backendHealth' in runtime
assert "toast('PIN inválido.'" in runtime
assert 'MASTER // BACKEND INDISPONÍVEL' in runtime
assert 'PIN inválido ou backend indisponível.' not in runtime
assert "if(document.activeElement!==$('#energy'))" in runtime


files_path=Path('public/files.js');files=files_path.read_text(encoding='utf-8')
old_new="let ids=new Set((d.files||[]).filter(f=>f.is_new).map(f=>f.id));";new_new="let ids=new Set((d.files||[]).filter(f=>f.is_new&&f.can_open).map(f=>f.id));";assert old_new in files;files=files.replace(old_new,new_new)
old_button="${submit&&!can?`<button class=\"btn\" onclick=\"paniDecodeOpen('${f.id}','${esc(f.display_name).replace(/'/g,'&#39;')}')\">ENVIAR MATERIAL À PANI</button>`:''}"
new_button="${submit&&!can?`<button class=\"btn\" onclick=\"paniDecodeOpen('${f.id}')\">ENVIAR MATERIAL À PANI</button>`:''}";assert old_button in files;files=files.replace(old_button,new_button)
old_decode="function paniDecodeOpen(id,name){$('#pfdecodeid').value=id;$('#pfdecodename').textContent=name;$('#pfdecodetext').value='';$('#pfdecode').classList.remove('hidden')}"
new_decode="function paniDecodeOpen(id){let f=pfCrewData?.files?.find(x=>x.id===id);$('#pfdecodeid').value=id;$('#pfdecodename').textContent=f?.display_name||'ARQUIVO';$('#pfdecodetext').value='';$('#pfdecode').classList.remove('hidden')}";assert old_decode in files;files=files.replace(old_decode,new_decode)

mime_helper="function pfMime(file){let t=(file?.type||'').toLowerCase();if(t)return t;let n=(file?.name||'').toLowerCase();return n.endsWith('.pdf')?'application/pdf':n.endsWith('.png')?'image/png':n.endsWith('.jpg')||n.endsWith('.jpeg')?'image/jpeg':n.endsWith('.webp')?'image/webp':'text/plain'}\n"
anchor="function pfMasterFileChosen(i){let f=i.files?.[0];if(f&&!$('#pfname').value)$('#pfname').value=f.name}\n";assert anchor in files;files=files.replace(anchor,anchor+mime_helper)
files=files.replace("mime_type:file.type||'text/plain'","mime_type:pfMime(file)")
files=files.replace("let fd=new FormData();fd.append('cacheControl','3600');fd.append('',file,file.name);","let mime=pfMime(file),uploadFile=file.type===mime?file:new File([file],file.name,{type:mime});let fd=new FormData();fd.append('cacheControl','3600');fd.append('',uploadFile,file.name);")
files=files.replace("payload.mime_type=file.type;","payload.mime_type=pfMime(file);")

old_mode="let can=f.can_open,submit=['corrupted','fragmented','decoding','encrypted'].includes(f.status);"
new_mode="let can=f.can_open,submit=['corrupted','fragmented','decoding'].includes(f.status),unlock=!can&&f.locked_reason==='CHAVE DE DECODIFICAÇÃO NECESSÁRIA';";assert old_mode in files;files=files.replace(old_mode,new_mode)
old_safe="${submit&&!can?`<button class=\"btn\" onclick=\"paniDecodeOpen('${f.id}')\">ENVIAR MATERIAL À PANI</button>`:''}"
new_safe="${submit&&!can?`<button class=\"btn\" onclick=\"paniDecodeOpen('${f.id}')\">ENVIAR MATERIAL À PANI</button>`:''}${unlock?`<button class=\"btn a\" onclick=\"paniUnlockOpen('${f.id}')\">INSERIR CHAVE</button>`:''}";assert old_safe in files;files=files.replace(old_safe,new_safe)
unlock_functions="""function paniUnlockOpen(id){let f=pfCrewData?.files?.find(x=>x.id===id);$('#pfunlockid').value=id;$('#pfunlockname').textContent=f?.display_name||'ARQUIVO';$('#pfunlockcode').value='';$('#pfunlock').classList.remove('hidden');setTimeout(()=>$('#pfunlockcode')?.focus(),30)}
function paniUnlockClose(){$('#pfunlock').classList.add('hidden')}
async function paniUnlockSubmit(){let id=$('#pfunlockid').value,code=$('#pfunlockcode').value.trim();if(!code)return toast('Informe a chave de decodificação.',true);let b=$('#pfunlocksend');b.disabled=true;try{let r=await rpc('pani_unlock_file',{p_token:tok,p_file:id,p_code:code});if(!r.ok)return toast(r.message||'CHAVE REJEITADA',true);paniUnlockClose();toast(r.message||'CHAVE ACEITA');await paniCrewFilesRefresh(false);render(true)}catch(e){toast('PANI // FALHA AO VALIDAR A CHAVE',true)}finally{b.disabled=false}}
function pfUnlockInject(){if($('#pfunlock'))return;document.body.insertAdjacentHTML('beforeend',`<div id=\"pfunlock\" class=\"modalback hidden\"><div class=\"card modal\"><div class=\"k\">PANI // CAMADA CRIPTOGRÁFICA</div><h3>CHAVE DE DECODIFICAÇÃO</h3><p id=\"pfunlockname\" class=\"mut\"></p><input id=\"pfunlockid\" type=\"hidden\"><input id=\"pfunlockcode\" autocomplete=\"off\" placeholder=\"INSERIR CHAVE\" onkeydown=\"if(event.key==='Enter')paniUnlockSubmit()\"><p class=\"small mut\">Tentativas são registradas pela PANI. A autorização vale somente para esta credencial.</p><div class=\"actions\"><button class=\"btn\" onclick=\"paniUnlockClose()\">CANCELAR</button><button id=\"pfunlocksend\" class=\"btn a\" onclick=\"paniUnlockSubmit()\">DECODIFICAR</button></div></div></div>`) }
"""
unlock_anchor="function paniDecodeClose(){$('#pfdecode').classList.add('hidden')}\n";assert unlock_anchor in files;files=files.replace(unlock_anchor,unlock_anchor+unlock_functions)
old_boot="pfInject();pfMasterInject();";new_boot="pfInject();pfUnlockInject();pfMasterInject();";assert old_boot in files;files=files.replace(old_boot,new_boot)

assert "f.is_new&&f.can_open" in files and "paniDecodeOpen('${f.id}')" in files and "function pfMime(file)" in files and "new File([file],file.name,{type:mime})" in files
assert "pani_unlock_file" in files and "INSERIR CHAVE" in files and "pfUnlockInject" in files
files_path.write_text(files,encoding='utf-8')

mission=Path('public/mission.js').read_text(encoding='utf-8')
mission_runtime=Path('public/mission-runtime.js').read_text(encoding='utf-8')
for required in ('pani_submit_report','pani_crew_redeem_credential','pani_master_access_code_upsert','missionTransmissionGlitch','RELATÓRIO DO DIA'):assert required in mission,required
assert "data-v=\"report\"" in mission_runtime
assert "view!=='cred'&&view!=='report'" in mission_runtime

assist=Path('public/assistance.js').read_text(encoding='utf-8')
for required in ('pani_assistance_submit','pani_assistance_reply','pani_crew_assistance','pani_master_assistance','pani_master_assistance_reply','CANAL DE SUPORTE','CAIXA DE SOLICITAÇÕES'):assert required in assist,required

for filename in ('index.html','style.css','files.css','mission.css','assistance.css','core.js','views.js','files.js','runtime.js','mission.js','mission-runtime.js','assistance.js'):
 p=Path('public')/filename;assert p.exists() and p.stat().st_size>100
print('PANI build audit OK // PRIVATE ASSISTANCE v6')
PY

node --check public/core.js
node --check public/views.js
node --check public/files.js
node --check public/runtime.js
node --check public/mission.js
node --check public/mission-runtime.js
node --check public/assistance.js

# End-to-end private Storage QA. The master PIN is supplied by Render environment,
# never written to the repository or public frontend.
if [[ -n "${PANI_MASTER_PIN:-}" ]]; then
  export PANI_STORAGE_QA
  PANI_STORAGE_QA="$(curl --fail --silent --show-error --max-time 20 \
    -H 'Content-Type: application/json' \
    --data "{\"action\":\"self_test\",\"pin\":\"${PANI_MASTER_PIN}\"}" \
    'https://nvwzcnfonhpilnxmopgi.supabase.co/functions/v1/pani-files')"
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

# PANI Transmission v7
bash pani-w77/render-transmission.sh
