import ts from 'typescript';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const input=fs.readFileSync('lib/model.ts','utf8');
fs.writeFileSync('lib/model.verify.mjs',ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
try{
 const {freshSheet,roll,expected,sheetSchema}=await import('../lib/model.verify.mjs');
 const s=freshSheet();s.class='combatente';s.nex=5;s.attributes.VIG=2;assert.equal(expected(s).pv,22);
 assert.equal(roll('2d20+5','max',()=>0).total,6);
 assert.equal(roll('2d20','min',()=>0.95).total,20);
 assert.throws(()=>roll('99d20','sum'));
 assert.equal(sheetSchema.safeParse({...s,pv:{current:100,max:1}}).success,false);
 assert.equal('role' in sheetSchema.parse({...s,role:'agente'}),false);
 const catalog=fs.readFileSync('lib/catalog.ts','utf8');
 const scopeCode=catalog.slice(catalog.indexOf('export type Scope='));
 fs.writeFileSync('lib/scope.verify.mjs',ts.transpileModule(scopeCode,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText);
 const {inScope}=await import('../lib/scope.verify.mjs');
 assert.equal(inScope('Ritual','Poderes'),false);assert.equal(inScope('Poder paranormal','Poderes'),true);assert.equal(inScope('Arma','Rituais'),false);assert.equal(inScope('Item amaldiçoado','Inventário'),true);
 console.log('10 verificações passaram: recursos, dados, validação e separação de catálogos.');
}finally{for(const p of ['lib/model.verify.mjs','lib/scope.verify.mjs'])if(fs.existsSync(p))fs.unlinkSync(p);}
