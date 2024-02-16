# A quoi servent les migrations ?

Parfois il est nécessaire de réaliser des opérations concrètes sur chaque Document, c'est à dire chaque actor ou chaque item d'un type donné. Par exemple, il y a certains cas où il est nécessaire de mettre à jour le fichier `template.json`, comme lorsque l'on ajoute/supprime/renomme une propriété aux données d'un Document (i.e, un actor ou item). Cependant, en général, Foundry n'implémentera pas automatiquement les changements souhaités :
- A la création d'une nouvelle propriété, Foundry l'ajoute automatiquement à tous les documents d'un type donné, définissant sa valeur à la valeur par défaut indiquée dans le `template.json`. Cependant, il n'est pas rare que nous souhaitions calculer la valeur de cette nouvelle propriété en fonction d'autres propriétés dans le document.
- A la suppression d'une propriété, Foundry va la retirer des documents mais il est possible que nous souhaitions conserver cette valeur à l'intéreur d'une autre propriété ou l'utiliser pour transformer une autre propriété.
- Renommer une propriété peut se voir comme une combinaison des deux exemples précédents: premièrement, nous voulons ajouter une *nouvelle* propriété (celle avec le nouveau nom) dans laquelle nous stockons la valeur de l'ancienne propriété (celle avec l'ancien nom). Autrement dit, la valeur de la nouvelle propriété est calculée en fonction de l'ancienne propriété. Une fois que la valeur est en sécurité dans la nouvelle propriété, nous pouvons supprimer l'ancienne propriété.

Pour tous ces cas (et probablement d'autres),  les migrations de données sont utilisées. Une migration de données est simplement une mise à jour massive de documents (d'un type donné) pour effectuer une transformation des données qu'ils contiennent. Il existe différentes stratégies qui pourraient être utilisées pour mettre en œuvre cette tâche (voir par exemple, les systèmes pour [DnD](https://github.com/foundryvtt/dnd5e/blob/master/module/migration.mjs) ou [Pathfinder](https://github.com/foundryvtt/pf2e/tree/be77d68bf011a6a4de40c44068a146579c73b4ff/src/module/migration); voir également la [vidéo YouTube](https://www.youtube.com/watch?v=Hl23n3MvtaI&t) pour une discussion claire sur le sujet.


# Notre modèle de migrations

> [!NOTE]
> Après cette section, expliquant comment notre modèle de migration fonctionne, il y a un court schèma qui détaille les étapes nécessaires requises pour ajouter une nouvelle migration.

Nous utilisons une stratégie inspirée de celle utilisée par le système Pathfinder, plus simple et adaptée à nos besoins. Chaque migration doit avoir un numéro (entier) de version qui sera utilisée pour garder une trace des migrations déjà appliquées et celles qui ne l'ont pas encore été. Chaque migration est spécifiée dans un objet qui implémente l'interface [`Migration`](/src/module/migration/migrations/Migration.d.ts).

Le système entier est implémenté dans `/src/module/migration/migrate.js`. Ce module exporte une fonction `applyMigrations()` qui est appelée par `Hooks.once('ready', ...)` dans le fichier `/src/animabf.mjs`. Une migration spécifique doit être implémentée à l'intérieur du répertoire `/src/module/migration/migrations/` doit commencer par un nombre suivi par une description significative de l'objectif de la migration. Chaque migration doit exporter un objet implémentant l'interface `Migration` définie à l'intérieur de `/src/module/migration/migrations/Migration.d.ts`, où se trouvent les éléments documentant la migration.

Enfin, `/src/module/migration/migrations/index.js` permet d'utiliser le module `/src/module/migrations` comme une liste de migrations, car il doit exporter toutes les migrations du système.

# Comment ajouter une nouvelle migration

1. Créez un nouveau fichier de migrations dans `/src/module/migration/migrations`. Son nom doit commencer par son numéro de migration et s'expliquer par lui-même; comme ci-après `42-purpose-of-this-migration.js`.
2. A l'intérieur de ce fichier, écrivez et exportez l'objet de la migration, implémentant les transformations requises pour la migration des données.
3. Exportez l'objet de la migration à partir du fichier `/src/module/migration/migrations/index.js`.
