# What are data migrations for?

Sometimes one may need to perform a concrete operation on every Document, that is, every actor or every item of a type. For instance, there are some cases in which the `template.json` needs to be updated, such as when adding/removing/renaming a property to a Document's (that is, an actor or item) data. However, Foundry might not implement automatically those changes as one needs:
- When creating a new property, Foundry automatically adds the property to all existing documents of the chosen type, setting its value to the default value indicated on the `template.json`. However, it is not rare that we might want to calculate the value of the new property form some other data in the document.
- When deleting a property, Foundry will remove it from documents but it is possible that we want to keep that value inside a different property or use it to transform another property.
- Renaming a property can be seen as a mix of the two previous examples: first, one wants to add a *new* property (the renamed one) inside which one saves the value of the old-named property (i.e., one *calculates* the value of the new property from the value of the old one). Once the value is saved on the new property, one wants to delete the old-named property.

For all this cases (and maybe more), data migrations are used. A data migration is just a mass update of Documents (of a type) to perform a transformation on the data they contain. There are several strategies one could use for implementing such a task (see e.g. [DnD](https://github.com/foundryvtt/dnd5e/blob/master/module/migration.mjs) or [Pathfinder](https://github.com/foundryvtt/pf2e/tree/be77d68bf011a6a4de40c44068a146579c73b4ff/src/module/migration) systems; see also this [YouTube](https://www.youtube.com/watch?v=Hl23n3MvtaI&t) video for a comprehensive discussion on the topic).


# Our migration model

> [!NOTE]
> After this section, explaining how our migration model works, there is a short outline detailing the steps one must follow to add a new migration.

We use a strategy inspired on that of Pathfinder system, simpler and adapted to our needs. Each migration must have an integer version number which will be used to keep track of the already applied migrations and is to be specified as an object implementing the [`Migration`](/src/module/migration/migrations/Migration.d.ts) interface.

The whole system is implemented inside `/src/module/migration/migrate.js`. This module exports a function `applyMigrations()` which is called inside `Hooks.once('ready', ...)` in `/src/animabf.mjs`. A particular migration must be implemented on a module inside the `/src/module/migration/migrations/` folder whose name must start by a number followed by a meaningful description of the migration's purpose. Each migration module must export an object implementing the interface `Migration` defined inside `/src/module/migration/migrations/Migration.d.ts`, where there is documentation on the migration's elements.

Finally, `/src/module/migration/migrations/index.js` allows using the `/src/module/migrations` module as a migration list, since it exports every migration in the system.

# How to add a new migration

1. Create a new migration file inside `/src/module/migration/migrations`. Its name should start by the migration number and be self-explaining; something like `42-purpose-of-this-migration.js`.
2. Inside that file, write and export the migration object, implementing the transformations required for the migration.
3. Export the migration object from the `/src/module/migration/migrations/index.js`.
