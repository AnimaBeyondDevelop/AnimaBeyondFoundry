import { splitAsActorAndItemChanges } from './splitAsActorAndItemChanges';

describe('splitAsActorAndItemChanges function', () => {
  it('must split actor and item changes', () => {
    //TODO: changes data.characteristics to system.characteristics
    const changes: Record<string, unknown> = {
      'data.characteristics.strength.value': 0,
      'system.dynamic.skill.UUID.value': 0
    };

    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(changes);

    const actorChangesKeys = Object.keys(actorChanges);
    const itemChangesKeys = Object.keys(itemChanges);

    expect(actorChangesKeys.length).toBe(1);
    expect(itemChangesKeys.length).toBe(1);

    expect(actorChangesKeys[0]).toBe('data.characteristics.strength.value');
    expect(itemChangesKeys[0]).toBe('system.dynamic.skill.UUID.value');
  });
});
