/* eslint-disable no-continue */
import { pathAffects } from './pathMatching';

/**
 * @typedef {Object} FlowWrite
 * @property {string} path
 * @property {'overwrite'|'modify'} kind
 */

/**
 * @typedef {Object} FlowOp
 * @property {string} id
 * @property {string[]} deps
 * @property {FlowWrite[]} writes
 * @property {(actor: any) => (void|Promise<void>)} apply
 * @property {{priority:number,effectId:string,index:number}|undefined} [_tie]
 */

const WRITE_PRECEDENCE = {
  overwrite: 0,
  modify: 1
};

function addEdge(outgoing, incoming, from, to) {
  if (from === to) return;
  const out = outgoing.get(from);
  if (!out.has(to)) {
    out.add(to);
    incoming.set(to, incoming.get(to) + 1);
  }
}

function compareTie(a, b) {
  const ta = a._tie ?? { priority: 0, effectId: a.id, index: 0 };
  const tb = b._tie ?? { priority: 0, effectId: b.id, index: 0 };

  if (ta.priority !== tb.priority) return tb.priority - ta.priority;
  if (ta.effectId !== tb.effectId) return ta.effectId.localeCompare(tb.effectId);
  return ta.index - tb.index;
}

export function orderFlowOps(ops) {
  // path -> writers
  const writersByPath = new Map();

  for (const op of ops) {
    for (const w of op.writes ?? []) {
      const list = writersByPath.get(w.path) ?? [];
      list.push({ op, kind: w.kind });
      writersByPath.set(w.path, list);
    }
  }

  const outgoing = new Map();
  const incoming = new Map();

  for (const op of ops) {
    outgoing.set(op, new Set());
    incoming.set(op, 0);
  }

  // 🔹 Rule 1: order writers of the SAME attribute by kind
  for (const [, writers] of writersByPath.entries()) {
    if (writers.length < 2) continue;

    for (let i = 0; i < writers.length; i++) {
      for (let j = 0; j < writers.length; j++) {
        if (i === j) continue;

        const a = writers[i];
        const b = writers[j];

        const pa = WRITE_PRECEDENCE[a.kind] ?? 0;
        const pb = WRITE_PRECEDENCE[b.kind] ?? 0;

        if (pa < pb) addEdge(outgoing, incoming, a.op, b.op);
      }
    }
  }

  // 🔹 Rule 2: writer → dependent if write affects dep path
  for (const dependent of ops) {
    for (const depAttr of dependent.deps ?? []) {
      for (const [writePath, writers] of writersByPath.entries()) {
        if (!pathAffects(writePath, depAttr)) continue;

        for (const w of writers) {
          if (w.op === dependent) continue;
          addEdge(outgoing, incoming, w.op, dependent);
        }
      }
    }
  }

  const queue = [];
  for (const [op, count] of incoming.entries()) {
    if (count === 0) queue.push(op);
  }
  queue.sort(compareTie);

  const result = [];
  while (queue.length) {
    const current = queue.shift();
    result.push(current);

    for (const next of outgoing.get(current)) {
      const newCount = incoming.get(next) - 1;
      incoming.set(next, newCount);
      if (newCount === 0) {
        queue.push(next);
        queue.sort(compareTie);
      }
    }
  }

  if (result.length !== ops.length) {
    throw new Error('No valid execution order exists (cycle detected).');
  }

  return result;
}
