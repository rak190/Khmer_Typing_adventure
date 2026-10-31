import { build } from 'esbuild';
await build({ entryPoints:['functions/index.ts'], bundle:true, platform:'node', format:'cjs', packages:'external', outfile:'functions/lib/index.cjs' });
