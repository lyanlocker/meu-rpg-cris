import type {Item} from './model';
export type Entry=Item;
export const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export type Scope="Poderes"|"Rituais"|"Inventário";
export function inScope(kind:string,scope:Scope){return scope==="Poderes"?["Habilidade","Poder paranormal"].includes(kind):scope==="Rituais"?kind==="Ritual":["Arma","Equipamento","Item amaldiçoado"].includes(kind);}
