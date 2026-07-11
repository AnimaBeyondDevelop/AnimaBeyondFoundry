import {
  buildSortUpdatesFromOrderedIds,
  computeReorderedIds,
  getItemIdsFromContainer,
  getSortSiblingsFromDom,
  resolveInsertBefore,
  resolveInsertPosition
} from './buildItemSortUpdates.js';

function makeArmorRow({ footerTop = 180, footerBottom = 220, rowTop = 100 } = {}) {
  const footer = {
    getBoundingClientRect: () => ({
      top: footerTop,
      bottom: footerBottom,
      left: 0,
      right: 200
    })
  };

  return {
    querySelector: selector => {
      if (selector === ':scope > .common-group > .group-footer') return footer;
      return null;
    },
    getBoundingClientRect: () => ({
      top: rowTop,
      bottom: footerBottom,
      left: 0,
      right: 200,
      height: footerBottom - rowTop
    }),
    dataset: { itemId: 'armor-1' }
  };
}

describe('resolveInsertPosition', () => {
  it('returns before when dropping on header/body above the footer', () => {
    const row = makeArmorRow();

    expect(resolveInsertPosition(row, 100, 120)).toBe('before');
    expect(resolveInsertPosition(row, 100, 179)).toBe('before');
    expect(resolveInsertBefore(row, 100, 150)).toBe(true);
  });

  it('returns after when dropping on the footer zone', () => {
    const row = makeArmorRow();

    expect(resolveInsertPosition(row, 100, 180)).toBe('after');
    expect(resolveInsertPosition(row, 100, 210)).toBe('after');
    expect(resolveInsertBefore(row, 100, 200)).toBe(false);
  });

  it('uses effect controls as the footer zone for effect rows', () => {
    const row = {
      querySelector: selector => {
        if (selector === ':scope > .common-group > .group-footer') return null;
        if (selector === ':scope > .effect-controls') {
          return {
            getBoundingClientRect: () => ({
              top: 100,
              bottom: 130,
              left: 150,
              right: 200
            })
          };
        }
        return null;
      },
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 130,
        left: 0,
        right: 200,
        height: 30
      })
    };

    expect(resolveInsertPosition(row, 50, 115)).toBe('before');
    expect(resolveInsertPosition(row, 170, 115)).toBe('after');
  });
});

describe('computeReorderedIds', () => {
  const ordered = ['a', 'b', 'c', 'd'];

  it('inserts above the target in the upper half', () => {
    expect(computeReorderedIds(ordered, 'd', 'b', false)).toEqual(['a', 'd', 'b', 'c']);
    expect(computeReorderedIds(ordered, 'a', 'c', false)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('inserts below the target in the lower half', () => {
    expect(computeReorderedIds(ordered, 'a', 'c', true)).toEqual(['b', 'c', 'a', 'd']);
    expect(computeReorderedIds(ordered, 'd', 'b', true)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('keeps order when dropping on itself', () => {
    expect(computeReorderedIds(ordered, 'b', 'b', true)).toEqual(ordered);
  });
});

describe('buildSortUpdatesFromOrderedIds', () => {
  it('assigns sequential sort values', () => {
    expect(buildSortUpdatesFromOrderedIds(['x', 'y', 'z'])).toEqual([
      { _id: 'x', sort: 100 },
      { _id: 'y', sort: 200 },
      { _id: 'z', sort: 300 }
    ]);
  });
});

describe('getSortSiblingsFromDom', () => {
  it('reads sibling order from container children', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div data-item-id="w1"></div>
      <div data-item-id="w2"></div>
      <div data-item-id="w3"></div>
    `;

    const actor = {
      items: {
        get: id => ({ id, type: 'weapon' })
      }
    };

    expect(getItemIdsFromContainer(container, { excludeId: 'w2' })).toEqual(['w1', 'w3']);
    expect(getSortSiblingsFromDom(actor, container, 'w2', '[data-item-id]').map(i => i.id)).toEqual([
      'w1',
      'w3'
    ]);
  });
});
