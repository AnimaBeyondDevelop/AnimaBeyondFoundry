import { splitAsActorAndItemChanges } from './splitAsActorAndItemChanges';

describe('splitAsActorAndItemChanges function', () => {
  it('must split actor and item changes', () => {
    const changes: Record<string, unknown> = {
      'data.characteristics.strength.value': 0,
      'data.dynamic.skill.UUID.value': 0
    };

    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(changes);

    const actorChangesKeys = Object.keys(actorChanges);
    const itemChangesKeys = Object.keys(itemChanges);

    expect(actorChangesKeys.length).toBe(1);
    expect(itemChangesKeys.length).toBe(1);

    expect(actorChangesKeys[0]).toBe('data.characteristics.strength.value');
    expect(itemChangesKeys[0]).toBe('data.dynamic.skill.UUID.value');
  });
});
