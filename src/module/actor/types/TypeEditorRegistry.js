// module/actor/types/TypeEditorRegistry.js
import { GenericBaseTypeEditor } from './GenericBaseTypeEditor.js';

export class TypeEditorRegistry {
  static #byType = new Map();

  /**
   * Register a custom editor for a BaseType
   * @param {string} type
   * @param {typeof FormApplication} editorCtor
   */
  static register(type, editorCtor) {
    this.#byType.set(type, editorCtor);
  }

  /**
   * Create an editor for a given type
   * @param {string} type
   * @param {Actor} actor
   * @param {{ path: string }}
   */
  static create(type, actor, { path }) {
    const Ctor = this.#byType.get(type) ?? GenericBaseTypeEditor;
    return new Ctor(actor, { type, path });
  }
}
