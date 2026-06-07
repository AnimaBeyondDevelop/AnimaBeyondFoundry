# Playbook: Añadir un nuevo tipo (hereda de BaseType)
> Referencia interna para saber exactamente qué tocar al crear un tipo nuevo
> como `Characteristic`, `Ability`, `SecondaryAbility`, `NumericalValue`, etc.
---
## Arquitectura de un vistazo
```
constants.js (INITIAL_ACTOR_DATA)  +  template.json
       │  __type markers en cada nodo tipado
       ▼
typedTemplateIndex.js
  └─ collectTypedFromTemplate()
       → TYPED_PATHS  (Map<systemPath, typeName>)
       → TYPED_DEFAULTS (Map<systemPath, defaults>)
       ▼
ABFActor.prepareDerivedData()
  ├─ inflateSystemFromTypeMarkers(this.system)   ← infla nodos con __type
  ├─ buildTypedNodes(this, TYPED_PATHS)          ← instancia BaseType por path
  │    actor.typedNodes = Map<path, instance>
  │    actor.typedRepo  = Map<type, Map<key, instance>>
  └─ runEffectFlow(this)
       ├─ getDerivedFlowSpecs() de cada nodo
       ├─ toposort por deps/mods
       └─ aplica compute() en orden correcto
```
---
## Checklist obligatorio
- [ ] **1. Clase en `concreteTypes/`**
- [ ] **2. Marcadores `__type` en `constants.js`**
- [ ] **3. Marcadores `__type` en `template.json`**
- [ ] **4. `getDerivedFlowSpecs()`** si hay campos calculados
- [ ] **5. `static editorConfig()`** para que el editor click-derecho funcione bien
- [ ] **6. Template HBS de visualización** en `src/templates/common/ui/types/`
- [ ] **6.1 Integrar ese partial en la vista consumidora** (actor/header/tab) para que el `path` real llegue al wrapper
- [ ] **6.2 Registrar el template en `module/utils/constants.js`** (`Templates.UI.Types` y `HandlebarsPartials`)
- [ ] **7. Build** (`npm run build` o `vite build`)
---
## Paso 1 — Crear la clase en `concreteTypes/`
**Ruta:** `src/module/actor/types/concreteTypes/MyType.js`
> El `typeRegistryLoader.js` usa `import.meta.glob('./concreteTypes/*.js', { eager: true })`
> y registra automáticamente cualquier clase exportada con `static type`.
> **No hay que tocar el loader.**
### Plantilla mínima (hereda de BaseType)
```js
import { BaseType } from '../BaseType.js';
export class MyType extends BaseType {
  static type = 'MyType';  // clave de registro, debe ser única
  // Getters de conveniencia
  get base()    { return this._get('base.value', 0); }
  get special() { return this._get('special.value', 0); }
  get final()   { return this._get('final.value', 0); }
  // OBLIGATORIO: forma del nodo
  static defaults() {
    return {
      base:    { value: 0 },
      special: { value: 0 },
      final:   { value: 0 },
      myFlag:  false,
      myText:  ''
    };
  }
  // Migración de datos viejos (opcional)
  static normalizeInflateInput(node) {
    if (!node || typeof node !== 'object') return node;
    const out = { ...node };
    // Ejemplo: { value: n } -> base.value
    if (out.value !== undefined && out.base === undefined) {
      out.base = { value: Number(out.value) || 0 };
      delete out.value;
    }
    return out;
  }
  // Config del editor genérico (recomendado)
  static editorConfig() {
    return {
      readonly: ['final.value'],
      hidden:   [],
      labels: {
        'base.value':    'Base',
        'special.value': 'Special',
        'final.value':   'Final',
        myFlag:          'Enable something',
        myText:          'Label'
      },
      order: ['base.value', 'special.value', 'final.value', 'myFlag', 'myText'],
      overrides: {}
    };
  }
  // Cálculos reactivos (si hay campos derivados)
  getDerivedFlowSpecs() {
    return [
      {
        id: 'final',
        deps: ['base.value', 'special.value'],   // relativos al systemPath del nodo
        mods: ['final.value'],
        compute: ({ base = 0, special = 0 }) => ({ final: base + special })
      }
    ];
  }
}
```
### Plantilla si hereda de NumericalValue (o sus subclases)
```js
import { NumericalValue } from './NumericalValue.js';
export class MyType extends NumericalValue {
  static type = 'MyType';
  static defaults() {
    return {
      ...super.defaults(),
      extraField: 0
    };
  }
  static normalizeInflateInput(node) {
    const out = super.normalizeInflateInput(node);
    // normaliza lo extra aquí
    return out;
  }
  static editorConfig() {
    const base = super.editorConfig();
    return {
      ...base,
      labels: { ...base.labels, extraField: 'Extra' },
      order:  [...base.order, 'extraField']
    };
  }
  // Sobreescribir _computeFinal si necesitas lógica propia:
  _computeFinal({ base = 0, special = 0 }) {
    const { final } = super._computeFinal({ base, special });
    return { final: final + this._get('extraField', 0) };
  }
}
```
### Jerarquía disponible para heredar
```
BaseType
  └── NumericalValue                     (base + special → final; soporta @formula)
        └── AffectedByCharacteristicValue  (+ attribute; añade delta de char)
              └── Ability                  (+ allActions / physicalActions mods)
                    └── SecondaryAbility   (+ naturalPenalty, perceptionPenalty)
BaseType
  └── Characteristic   (base + special → final clamp[0,20] + mod)
BaseType
  └── Resistance       (base + special + charFinal → final)
```
---
## Paso 2 — Añadir `__type` en `constants.js`
**Ruta:** `src/module/actor/constants.js`  
**Variable:** `INITIAL_ACTOR_DATA`
Este árbol JS es el que escanea `collectTypedFromTemplate()` para construir `TYPED_PATHS`.
```js
// Forma básica:
myField: { __type: '{"type":"MyType"}' }
// Con overrides (parámetros de instancia):
myAbility: { __type: '{"type":"SecondaryAbility","attribute":"agility"}' }
// Con override de campo numérico:
myNode: { __type: '{"type":"MyType","extraField":5}' }
```
> **Importante:** el JSON del marcador debe ser una string válida, sin saltos de línea,
> con comillas escapadas.
---
## Paso 3 — Añadir `__type` en `template.json`
**Ruta:** `src/template.json`
Foundry usa este archivo como schema. Si el campo no está aquí, Foundry puede descartarlo al guardar.
```json
"myField": { "__type": "{\"type\":\"MyType\"}" }
```
Debe tener la misma estructura que `constants.js` (mismo path, mismos overrides).
---
## Paso 4 — `getDerivedFlowSpecs()` (campos calculados)
El motor `runEffectFlow` hace:
1. Lee los valores de `deps` del actor
2. Llama a `compute(inputs)` → devuelve `{ fieldName: valor }`
3. Escribe los resultados en las rutas de `mods`
### Reglas de paths
- `deps` y `mods`: **relativos** al `systemPath` del nodo (`'base.value'`, `'final.value'`)
- Paths externos al nodo: **absolutos** con prefijo `system.` (`'system.general.modifiers.allActions.final.value'`)
- Para deps externos dinámicos (dependen del estado del nodo): usar `setInstanceDeps(specId, [...])`
### Ejemplo con deps externas dinámicas
```js
getDerivedFlowSpecs() {
  const specs = super.getDerivedFlowSpecs();
  const finalSpec = specs.find(s => s.id === 'final');
  if (finalSpec) {
    finalSpec.deps = [...finalSpec.deps, 'myFlag'];
    finalSpec.compute = this._computeFinal.bind(this);
    if (this._get('myFlag', false)) {
      this.setInstanceDeps('final', ['system.general.someValue.final.value']);
    } else {
      this.clearInstanceDeps('final');
    }
  }
  return this._mergeInstanceDeps(specs);
}
```
### Atención: claves de retorno en `compute()`
`compute()` devuelve claves **sin** `.value`:
```js
// CORRECTO:
compute: ({ base, special }) => ({ final: base + special })
// INCORRECTO:
compute: ({ base, special }) => ({ 'final.value': base + special })
```
El sistema añade `.value` automáticamente desde `mods`.
---
## Paso 5 — `editorConfig()` (editor click-derecho)
`GenericBaseTypeEditor` auto-genera un formulario a partir de `defaults()` + `editorConfig()`.
### Tipos de campo soportados
| Valor en `defaults()` | `kind` inferido | Render |
|---|---|---|
| `number` | `'number'` | `<input type="number">` |
| `boolean` | `'bool'` | `<input type="checkbox">` |
| `string` | `'string'` | `<input type="text">` |
| `string` con overrides | `'select'` | `<select>` |
### Opciones dinámicas para un `select`
Implementar el estático `getEditorFieldOptions(actor)` en la clase:
```js
static getEditorFieldOptions(actor) {
  const options = [];
  const byKey = actor?.typedRepo?.get('Characteristic');
  if (byKey) {
    for (const node of byKey.values()) {
      options.push({ value: node.key, label: node.key });
    }
  }
  return { attribute: options };  // key = fieldPath del campo
}
```
Y en `editorConfig()`:
```js
overrides: {
  attribute: { kind: 'select' }
}
```
---
## Paso 6 — Template HBS de visualización
**Ruta:** `src/templates/common/ui/types/my-type.hbs`
> Necesario para mostrar el nodo en la ficha del actor con menú contextual.
```hbs
{{#> "ui/base-type-wrapper"
    path=path
    class="my-type-row"}}
  {{> "systems/animabf/templates/common/ui/horizontal-titled-input.hbs"
    class="my-type"
    title=title
    inputName=(concat path ".base.value")
    inputValue=value.base.value
    hasSecondaryInput=true
    secondaryInputName=(concat path ".special.value")
    secondaryInputValue=value.special.value
    hasTertiaryInput=true
    tertiaryInputName=(concat path ".final.value")
    tertiaryInputValue=value.final.value
    disableTertiaryInput=true
  }}
{{/ "ui/base-type-wrapper"}}
```
Usarlo desde la hoja del actor: `{{> "ui/types/my-type" path=... value=... title=...}}`.

### Requisito para abrir el editor del tipo

Para que funcione el click derecho (`Edit…`) el nodo debe renderizarse dentro de `ui/base-type-wrapper` y recibir un `path` valido.

Ejemplo correcto:

```hbs
{{#> "ui/base-type-wrapper" path=path class="my-type-row"}}
  ...
{{/ "ui/base-type-wrapper"}}
```

Y ese partial debe usarse en la vista real que pinta el actor (header/tab), por ejemplo:

```hbs
{{> "systems/animabf/templates/common/ui/types/my-type.hbs"
    path=(concat "system.algo." key)
    value=node
    title=... }}
```

Sin este paso, el tipo existe y calcula bien, pero no se puede abrir su editor contextual.
### Paso 6.2 — Registrar en `module/utils/constants.js`
**Ruta:** `src/module/utils/constants.js`
Añadir la ruta del template en `Templates.UI.Types`:
```js
// En el objeto Templates.UI.Types:
MyType: T('common/ui/types/my-type.hbs')
```
Y registrar el partial en `HandlebarsPartials` para que Handlebars lo resuelva:
```js
// En el objeto HandlebarsPartials:
'ui/types/my-type': Templates.UI.Types.MyType
```
> Sin este paso, el partial `{{> "ui/types/my-type" ...}}` fallará en tiempo de ejecución
> porque Handlebars no lo encontrará registrado.
---
## Paso 7 — Editor personalizado (solo si es necesario)
Si `GenericBaseTypeEditor` no es suficiente:
```js
// src/module/actor/types/customEditors/MyTypeEditor.js
import { GenericBaseTypeEditor } from '../GenericBaseTypeEditor.js';
export class MyTypeEditor extends GenericBaseTypeEditor {
  // sobreescribe getData(), activateListeners(), _updateObject() si hace falta
}
```
Registrarlo en el punto de entrada de la aplicación:
```js
import { TypeEditorRegistry } from '.../TypeEditorRegistry.js';
import { MyTypeEditor } from '.../MyTypeEditor.js';
TypeEditorRegistry.register('MyType', MyTypeEditor);
```
---
## Errores comunes
| Síntoma | Causa probable |
|---|---|
| `Unknown type: MyType` | La clase no está exportada o no tiene `static type` |
| El campo no se guarda | Falta el marcador en `template.json` |
| Los cálculos no se actualizan | `getDerivedFlowSpecs()` no declara todas las deps necesarias |
| El editor click-derecho no abre | El elemento HTML no tiene clase `.base-type-row` o el `data-path` no coincide |
| Datos viejos corruptos al cargar | Falta `normalizeInflateInput()` para migrar la forma antigua |
| `compute` no escribe nada | Las claves del objeto devuelto no coinciden con los fields declarados en `mods` |
---
## Archivos a tocar — resumen
```
src/
  module/actor/
    types/
      concreteTypes/
        MyType.js             ← (1) CLASE NUEVA — siempre
    constants.js              ← (2) __type en INITIAL_ACTOR_DATA — siempre
  template.json               ← (3) __type en schema Foundry — siempre
  templates/
    common/ui/types/
      my-type.hbs             ← (6) visualización reusable con `ui/base-type-wrapper`
  templates/
    actor/.../*.hbs
      ...invocación a my-type.hbs ← (6.1) integración en la vista consumidora
```
Los archivos `TypeRegistry.js`, `typeRegistryLoader.js`, `inflateSystemFromTypeMarkers.js`,
`buildTypedNodes.js`, `runtimeTypedNodes.js` y `runFlow.js` son **infraestructura genérica,
no se tocan**.
