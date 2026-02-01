// utils/templatePaths.js
import { Templates } from '../module/utils/constants.js';

function collect(obj, out = []) {
  if (typeof obj === 'string') {
    out.push(obj);
    return out;
  }
  if (!obj || typeof obj !== 'object') return out;
  for (const v of Object.values(obj)) collect(v, out);
  return out;
}

export const TEMPLATE_PATHS = [...collect(Templates)];
