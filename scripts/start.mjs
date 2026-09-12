import {spawn} from 'node:child_process';
const p=spawn('npm',['run',process.env.RENDER==='true'?'start':'dev:local'],{stdio:'inherit',env:process.env});p.on('error',e=>{console.error(e);process.exit(1)});p.on('exit',c=>process.exit(c??1));
