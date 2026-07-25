import { metricCoarseThreads } from './metricCoarse';
import { metricFineThreads } from './metricFine';
import { uncThreads } from './unc';
import { unfThreads } from './unf';
import { nptThreads } from './npt';
import { bsptThreads } from './bspt';
import { bsppThreads } from './bspp';
import { trapezoidalThreads } from './trapezoidal';
import { squareThreads } from './square';
import { bswThreads, bsfThreads } from './bsw_bsf';

export const THREAD_CATEGORIES = [
  { key: 'metricCoarse', label: 'METRIK KASAR', data: metricCoarseThreads },
  { key: 'metricFine', label: 'METRIK HALUS', data: metricFineThreads },
  { key: 'unc', label: 'UNC', data: uncThreads },
  { key: 'unf', label: 'UNF', data: unfThreads },
  { key: 'npt', label: 'NPT', data: nptThreads },
  { key: 'bspt', label: 'BSPT', data: bsptThreads },
  { key: 'bspp', label: 'BSPP', data: bsppThreads },
  { key: 'trapezoidal', label: 'TRAPESIUM', data: trapezoidalThreads },
  { key: 'square', label: 'SEGIEMPAT', data: squareThreads },
  { key: 'bsw', label: 'BSW', data: bswThreads },
  { key: 'bsf', label: 'BSF', data: bsfThreads },
];

export function getAllThreads() {
  const all = [];
  THREAD_CATEGORIES.forEach(cat => {
    cat.data.forEach(t => {
      all.push({ ...t, category: cat.key, categoryLabel: cat.label });
    });
  });
  return all;
}

export function getThreadsByCategory(categoryKey) {
  const cat = THREAD_CATEGORIES.find(c => c.key === categoryKey);
  return cat ? cat.data : [];
}

export function findThreadByDesignation(designation) {
  return getAllThreads().find(t => t.designation === designation);
}
