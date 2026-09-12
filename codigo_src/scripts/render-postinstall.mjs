import {spawnSync} from 'node:child_process';
if(process.env.RENDER==='true'){const r=spawnSync('npm',['run','build'],{stdio:'inherit',env:process.env});if(r.error)throw r.error;process.exit(r.status??1);}
