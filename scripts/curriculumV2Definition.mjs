// Aggregator for all 6 Worlds in Curriculum V2
import { getWorld1 } from './curriculum_w1.mjs';
import { getWorld2 } from './curriculum_w2.mjs';
import { getWorld3 } from './curriculum_w3.mjs';
import { getWorld4 } from './curriculum_w4.mjs';
import { getWorld5 } from './curriculum_w5.mjs';
import { getWorld6 } from './curriculum_w6.mjs';

export function buildAllCurriculumWorlds() {
  return [
    getWorld1(),
    getWorld2(),
    getWorld3(),
    getWorld4(),
    getWorld5(),
    getWorld6(),
  ];
}
