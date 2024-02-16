# Para qué sirven las migraciones?

En ocasiones, es necesario realizar operaciones concretas en cada Documento (es decir, en cada actor o cada item de un tipo). Por ejemplo, hay algunos casos en los que el archivo `template.json` necesita actualizarse, como cuando se añade/elimina/renombra una propiedad en los datos de un Documento (i.e., un actor o item). Sin embargo, Foundry en general no implementará los cambios deseados automáticamente:
- Al crear una propiedad nueva, Foundry la crea automáticamente en todos los Documentos existentes del tipo correspondiente, estableciendo como valor para la misma el valor *por defecto* que se indica en el `template.json`. Sin embargo, no es raro calcular el nuevo valor en función de otras propiedades en el documento.
- Al borrar una propiedad, Foundry la eliminará de los documentos pero es posible que queramos mantener el valor correspondiente dentro de otra propiedad, ya sea tal cual estaba o transformándolo en el proceso.
- Renombrar una propiedad puede verse como una concatenación de los dos ejemplos anteriores: primero, queremos añadir una *nueva* propiedad (la que tiene el nuevo nombre), en la cual guardaremos el valor de la propiedad *vieja* (la que tiene el nombre anterior). Esto es, se *calcula* el valor de la nueva propiedad en función de la propiedad anterior. Una vez el valor está a salvo en la nueva propiedad, podemos eliminar la propiedad antigua.

Para todos estos casos (y probablemente más), se usan las migraciones de datos. Una migración de datos es simplemente una actualización masiva de Documentos (de un tipo dado) para realizar una transformación de los datos que contienen. Hay distintas estrategias que podrían usarse para implementar esta tarea (ver, por ejemplo, los sistemas para [DnD](https://github.com/foundryvtt/dnd5e/blob/master/module/migration.mjs) o [Pathfinder](https://github.com/foundryvtt/pf2e/tree/be77d68bf011a6a4de40c44068a146579c73b4ff/src/module/migration); también este [vídeo de Youtube](https://www.youtube.com/watch?v=Hl23n3MvtaI&t) para una discusión clara del tema).


# Nuestro modelo de migraciones

> [!NOTE]
> Tras esta sección, que explica cómo funciona nuestro modelo de migraciones, hay un esquema detallando los pasos a seguir para añadir una nueva migración al sistema.

Usamos una estrategia inspirada en la que usan en el sistema de Pathfinder, simplificada y adaptada a nuestras necesidades. Cada migración debe tener un número (entero) de versión, que se usará para tener en cuenta qué migraciones ya han sido aplicadas y cuales no. Cada migración se especificará en un objeto que implementará la interfaz [`Migration`](/src/module/migration/migrations/Migration.d.ts).

Todo el sistema de migraciones está implementado en [`/src/module/migration/migrate.js`](/src/module/migration/migrate.js). Dicho módulo exporta una función `applyMigrations()` que es llamada dentro de `Hooks.once('ready', ...)` en [`/src/animabf.mjs`](/src/animabf.mjs). Cada migración concreta debe ser implementada en un módulo dentro de la carpeta `/src/module/migration/migrations/`, cuyo nombre debe comenzar por un número entero seguido de un nombre que describa el propósito de la migración. Cada módulo de migración debe exportar un objeto implementando la interfaz `Migration` definida en [`/src/module/migration/migrations/Migration.d.ts`](/src/module/migration/migrations/Migration.d.ts) (allí se encuentran documentados los elementos que debe contener dicho objeto). 

Finalmente, [`/src/module/migration/migrations/index.js`](/src/module/migration/migrations/index.js) permite usar el módulo `/src/module/migrations` como una lista de migraciones, dado que debe exportar todas las migraciones del sistema.


# Cómo añadir una migración nueva

1. Crear un nuevo archivo de migración dentro de `/src/module/migration/migrations`. El nombre debe empezar por el número de la migración y ser autoexplicativo; algo como `42-purpose-of-this-migration.js`.
2. Dentro de ese archivo, definir y exportar el objeto de la de la migración, que implementará las transformaciones requeridas para la migración de datos.
3. Exportar el archivo de migración desde el archivo `/src/module/migration/migrations/index.js`.
