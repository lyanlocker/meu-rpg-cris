#!/usr/bin/env bash
set -euo pipefail

cp pani-w77/transmission.css pani-w77/transmission.js public/

python3 - <<'PY'
from pathlib import Path
p=Path('public/index.html')
s=p.read_text(encoding='utf-8')
if './transmission.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="./transmission.css"></head>',1)
if './transmission.js' not in s:
    s=s.replace('</body>','<script src="./transmission.js"></script></body>',1)
assert './transmission.css' in s
assert './transmission.js' in s
assert s.index('./transmission.js') > s.index('./runtime.js')
p.write_text(s,encoding='utf-8')

js=Path('public/transmission.js').read_text(encoding='utf-8')
for needle in (
    'pani_master_transmission_catalog',
    'pani_master_transmission_dispatch',
    'pani_master_transmission_stop',
    'pani_master_transmission_active',
    'pani_crew_transmission_feed',
    'TX_ASSET_BASE',
    'TRANSMITIR SÍMBOLO',
):
    assert needle in js, needle
print('PANI transmission build audit OK // ALIEN SIGNAL CONSOLE v7')
PY

node --check public/transmission.js
