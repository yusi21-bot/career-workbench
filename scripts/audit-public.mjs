import {readdir,readFile} from 'node:fs/promises';
const excluded=new Set(['node_modules','dist','.git']);
async function walk(root){const files=[];for(const d of await readdir(root,{withFileTypes:true})){if(excluded.has(d.name))continue;const p=`${root}/${d.name}`;if(d.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const files=await walk('.');const failures=[];
const patterns=[/sk-[A-Za-z0-9_-]{20,}/,/gh[pousr]_[A-Za-z0-9]{20,}/,/AKID[A-Za-z0-9]{16,}/,/\/Users\//,/file:\/\//,/\b1[3-9]\d{9}\b/];
for(const p of files){if(!/\.(tsx?|mjs|json|html|css|md|ya?ml)$/.test(p)||p.endsWith('audit-public.mjs'))continue;const s=await readFile(p,'utf8');if(patterns.some(r=>r.test(s)))failures.push(p);}
if(failures.length){console.error('Review potentially private content in:',failures);process.exit(1);}
console.log('Public-source pattern audit passed. Manual content review remains necessary.');
