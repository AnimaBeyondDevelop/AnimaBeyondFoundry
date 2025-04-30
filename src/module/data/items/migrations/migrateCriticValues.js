import { NoneCriticType } from '../enums/CriticEnums.js';

export function migrateCriticValues(data) {
  for (let key in data.critic) {
    if (data.critic[key]?.value === '-') {
      data.critic[key].value = NoneCriticType.NONE;
    }
  }
  if (data.critic?.value === '-') {
    data.critic.value = NoneCriticType.NONE;
  }
  return data;
}
