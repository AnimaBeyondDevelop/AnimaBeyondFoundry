# Añadir un nuevo item al actor

A veces queremos que un campo del actor sea dinámico, es decir, que queramos añadir, editar y eliminar ciertos elementos como por ejemplo las posibles armas que lleve el personaje o los hechizos aprendidos. Para ello recopilo aquí los pasos a realizar para añadir un nuevo tipo de elemento (llamado **Items** en Foundry VTT) a nuestro actor:

## Pasos

### Añadir el item al template.json

El fichero `template.json` contiene la información de nuestro actor. Uno de los elementos que contiene son aquellos items que somos capaces de crear dinámicamente para el actor.

Lo podemos encontrar casi al final del fichero, contiene una clave `"Item"` seguido de aquellos posibles elementos a añadir: `types`.

A la hora de escribir este documento los tipos que hay son los siguientes:

```json
{
  "Item": {
    "types": [
      "consumable",
      "misc",
      "weapon",
      "shield",
      "ammunition",
      "armor",
      "helmet",
      "skill",
      "freeAccessSpell"
    ]
  }
}
```

Una vez añadido al array la clave de nuestro nuevo item continuamos.

**NOTA:** El nombre del elemento no debe contener caracteres especiales como barras o guiones medios.

Un poco más abajo definiremos el contenido del `data` que tendrá nuestro item, tenemos dos ejemplos:

```json
{
  "freeAccessSpell": {
    "level": 0
  },
  "skill": {
    "value": 0
  }
}
```

Añadimos el nuestro debajo y ya solo nos queda un paso más: elegir en los datos del actor donde se van a "almacenar" nuestros nuevos items. Por ejemplo, si hacemos una búsqueda de `freeAccessSpell`, este se encontrará bajo `mystic`, uno de los campos de nuestro actor.

```json
{
  "character": {
    "description": ...,
    "flags": ...,
    "characteristics": ...,
    "secondaries": ...,
    "combat": ...,
    "mystic": {
      ...,
      "freeAccessSpells": [],
      ...
    },
    ...
  }
}
```

Una vez hecho esto, _listo_, ya hemos acabado con el `template.json`.

## Añadir los métodos de creación y edición de nuestro item

Nos vamos al fichero `ItemChanges` y definimos nuestro nuevo tipo, aquí veréis dos ejemplos: `SkillChange` y `FreeAccessSpellChange`. Cread vuestro nuevo tipo y modificad lo necesario.

**NOTA**: Dentro de cada cambio hay un elemento que veréis representado como `[key: string]`, este apartado es **obligatorio para todos los items nuevos**.

Una vez tengamos nuestro nuevo tipo de cambio nos vamos al fichero **ABFActor** y crearemos dos nuevos métodos: uno para crear el item, y otro para editarlo. Aquí hay un ejemplo para usar como plantilla: `addFreeAccessSpellSlot` y `editFreeAccessSpells`.

Cread los vuestros propios y dadle un nombre apropiado.

Ahora nos dirigimos a la clase `ABFActorSheet` y buscamos un método llamado `updateItems` en el cual cogiendo como referencia otros cambios, añadimos el nuestro, por ejemplo tenemos el de los hechizos de acceso libre:

```ts
if (unflattedChanges.data.dynamic.freeAccessSpells) {
  this.actor.editFreeAccessSpells(unflattedChanges.data.dynamic.freeAccessSpells);
}
```

Si os fijáis está llamando al método `editFreeAccessSpells`, nosotros sustituiremos todo lo relacionado con `freeAccessSpells` por nuestros métodos y nuestros tipos.

### Añadir nuestros items al HTML

Para esto es mejor seguir el ejemplo de otros elementos dinámicos, como por ejemplo el de las habilidades secundarias especiales: [https://github.com/Guote/AnimaBeyondFoundry/blob/c6500e43682605884f6f48cc9720effc850d69a5/src/templates/parts/secondaries.html#L112](https://github.com/Guote/AnimaBeyondFoundry/blob/c6500e43682605884f6f48cc9720effc850d69a5/src/templates/parts/secondaries.html#L112)

Como veréis ahí hay un atributo HTML llamado `data-on-click`, y en este caso, con el valor de: `add-secondary-skill`. Siguiendo el mismo patrón nostros le daremos el valor correspondiente a nuestro elemento nuevo

No os olvidéis de añadir también un botón para eliminar el item, un poco más abajo del botón para añadir veremos un `data-on-click` con el valor de `delete-item`, usaremos el mismo patrón para nuestro nuevo elemento. Sobre este apartado es importante recalcar que el botón de eliminar debe tener otro atributo llamado `data-item-id` que debe contener el valor del id de nuestro item.

### Añadir nuestros disparadores para los botones

Nos dirigimos nuevamente a la clase `ABFActorSheet` y buscamos el método `activateListeners`. Aquí cogemos como plantilla el disparador de adición de cualquier otro item y llamamos a nuestro método recien creado de crear nuestro nuevo item.

### Crear un parseador del item a los datos del actor

Para esto vamos a copiar uno de las funciones de cualquier otro item, por ejemplo, el de `attachFreeAccessSpell` y lo adecuamos a nuestras necesidades, dependiendo de donde queramos poner nuestro nuevo item.

### Añadir el parseador de item a datos de actor

Para este paso nos vamos a un fichero que se llama `prepareItems.ts` y añadimos nuestro nuevo item al array de `VALID_COLLECTIONS` y añadimos un nuevo case al switch llamando al método de attacheo creado anteriormente

## Listo

Si hemos seguido todos los pasos correctamente deberíamos tener listo nuestro nuevo item. Si tienes cualquier duda no dudes en comentármelo en el discord: **@Linkaynn**
