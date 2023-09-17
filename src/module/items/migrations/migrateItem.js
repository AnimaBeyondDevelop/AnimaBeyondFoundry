import { migrateToV1 } from './migrateToV1';

export const migrateItem = item => {
  return migrateToV1(item);
};
