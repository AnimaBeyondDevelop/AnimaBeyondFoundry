import { WeaponDataSource, WeaponKnowledgeType } from '../../../../../../../types/combat/WeaponItemConfig';

export const getWeaponKnowledgePenalty = (weapon: WeaponDataSource) => {
  switch (weapon.data.knowledgeType.value) {
    case WeaponKnowledgeType.SIMILAR:
      return -20;
    case WeaponKnowledgeType.MIXED:
      return -40;
    case WeaponKnowledgeType.DIFFERENT:
      return -60;
    default:
      return 0;
  }
};
