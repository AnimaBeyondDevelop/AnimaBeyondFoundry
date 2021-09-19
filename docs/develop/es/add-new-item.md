# Añadir un nuevo item al actor

A veces queremos que un campo del actor sea dinámico, es decir, que queramos añadir, editar y eliminar ciertos elementos como por ejemplo las posibles armas que lleve el personaje o los hechizos aprendidos. Para ello recopilo aquí los pasos a realizar para añadir un nuevo tipo de elemento (llamado **Items** en Foundry VTT) a nuestro actor:

## Pasos

### 1. Decidir si el elemento es interno o externo

Los items pueden ser de dos tipos: **internos o externos**

Los internos son aquellos que pertenecen al actor y que sus valores difieren entre diferentes actores, dos ejemplos:

- Habilidades nuevas secundarias: el valor de una habilidad llamada "Cocina" puede ser diferente de un actor a otro
- Arquetipos: cada actor puede tener un arquetipo distinto

Los externos son aquellos que se podrían reutilizar entre actores, el ejemplo más clásico: las armas. Las armas pueden ser utilizadas por distintos actores independientemente, como por ejemplo, una espada.

### 2. Añadir el item al template.json

**NOTA: Si has decidido que tu item sea interno, sáltate este paso**

El fichero `template.json` contiene la información de nuestro actor. Uno de los elementos que contiene son aquellos items que somos capaces de crear dinámicamente para el actor.

Lo podemos encontrar casi al final del fichero, contiene una clave `"Item"` seguido de aquellos posibles elementos a añadir: `types`.

A la hora de escribir este documento los tipos que hay son los siguientes:

```json
{
  "Item": {
    "types": ["spell", "advantage"]
  }
}
```

Una vez añadido al array la clave de nuestro nuevo item continuamos.

**NOTA:** El nombre del elemento no debe contener caracteres especiales como barras o guiones medios.

Un poco más abajo definiremos el contenido del `data` que tendrá nuestro item, en caso de que solo tenga "nombre" no hace falta rellenar lo siguiente. Tenemos dos ejemplos:

```json
{
  "spell": {
    "level": 0
  }
}
```

Si te fijas, `advantage`, no tiene definido un `data` y esto es porque Foundry por defecto ya nos da el nombre como un campo externo a su data (y obligatorio).

Añadimos el nuestro debajo y ya solo nos queda un paso más: elegir en los datos del actor donde se van a "almacenar" nuestros nuevos items. Por ejemplo, si hacemos una búsqueda de `spell`, este se encontrará bajo `mystic`, uno de los campos de nuestro actor.

```json
{
  "character": {
    "description": ...,
    "characteristics": ...,
    "secondaries": ...,
    "combat": ...,
    "domine": ...,
    "mystic": {
      ...,
      "spells": [],
      ...
    },
    ...
  }
}
```

Una vez hecho esto, _listo_, ya hemos acabado con el `template.json`.

### 3. Añadir a ABFItems el nombre del item

Existe un fichero llamado `ABFItems` que contiene todos los items que se pueden crear, aquí crearemos una nueva entrada cuyo valor tendrá que ser igual al nombre que le hayamos dado en el `template.json` en caso de que sea externo, o el que queramos si es interno.

Por ejemplo, para los hechizos de libre creación:

```ts
export enum ABFItems {
  SPELL = 'spell'
}
```

### 4. Añadir la configuración de item

En la carpeta `module/types` encontrarás varias subcarpetas que hacen referencia a donde se encuentra dichos items, por ejemplo: `mystic` o `psychic`

Una vez localizada (o creada si no existe) la carpeta que alojará la configuración del nuevo item, creamos un fichero y escogemos uno de los dos templates a continuación dependiendo de lo que contenga el `data`.

En caso de que el nuevo item tenga solo nombre, recomiendo coger como template: `AdvantageItemConfig.ts`.
En caso de que el nuevo item tenga más datos, recomiendo coger como template: `ContactItemConfig.ts`.

Toda la información de los campos a crear está documentado en el fichero `Items.ts`

### 5. Añadir nuestro item a la lista de items disponibles

En el fichero `module/actor/utils/prepareSheet/prepareItems/constants.ts` se encuentran dos objetos: `INTERNAL_ITEM_CONFIGURATION` y `ITEM_CONFIGURATIONS`

Añadimos a uno de los dos objetos nuestra nueva configuración de item.

#### 6. Añadir, si es un elemento externo, su tipo a Foundry

**NOTA: Este paso es sólo si tu item es externo**

En el fichero `animabf.types.ts` se encuentra un tipo compuesto llamado `ABFItemsDataSource`, en él deberemos añadir nuestro nuevo item data source.

### 7. Añadir nuestros items al HTML

Para esto es mejor seguir el ejemplo de otros elementos dinámicos, como por ejemplo el de los hechizos: [https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/blob/develop/src/templates/parts/mystic/parts/spells.hbs](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/blob/develop/src/templates/parts/mystic/parts/spells.hbs)

Existen varios componentes reutilizables, recomiendo hacer una lectura de distintas partes HBS para comprenderlas mejor.

## Listo

Si hemos seguido todos los pasos correctamente deberíamos tener listo nuestro nuevo item. Si tienes cualquier duda no dudes en comentármelo en el discord: **@Linkaynn**
