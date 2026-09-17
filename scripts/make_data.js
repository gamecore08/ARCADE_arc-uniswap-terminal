import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../public/arc_real_pools.json');
const pools = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const outContent = `import { Pool } from '../types';

export const REAL_ARC_POOLS: Pool[] = ${JSON.stringify(pools, null, 2)} as Pool[];
`;

const dataDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const targetPath = path.resolve(dataDir, 'realPools.ts');
fs.writeFileSync(targetPath, outContent, 'utf8');
console.log(`Generated ${targetPath} with ${pools.length} real Arc Uniswap pools.`);
