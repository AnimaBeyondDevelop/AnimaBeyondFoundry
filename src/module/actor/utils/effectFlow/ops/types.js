/**
 * @typedef {Object} OpTie
 * @property {number} priority
 * @property {string} effectId
 * @property {number} index
 */

/**
 * @typedef {'overwrite'|'modify'} WriteKind
 *
 * @typedef {Object} FlowWrite
 * @property {string} path
 * @property {WriteKind} kind
 *
 * @typedef {Object} FlowOp
 * @property {string} id
 * @property {string[]} deps
 * @property {FlowWrite[]} writes
 * @property {(actor:any)=>(void|Promise<void>)} apply
 * @property {{priority:number,effectId:string,index:number}} [_tie]
 */
export {};
