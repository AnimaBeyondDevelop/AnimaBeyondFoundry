# Ajouter un nouvel item à l'acteur

Parfois, nous voulons qu'un champ de l'acteur soit dynamique, c'est-à-dire que nous voulons ajouter, éditer et supprimer certains éléments comme par exemple les armes que le personnage peut porter ou les sorts appris. Voici les étapes à suivre pour ajouter un nouveau type d'élément (appelé **Items** dans Foundry VTT) à notre acteur :

## Étapes

### 1. Décider si l'élément est interne ou externe

Les items peuvent être de deux types : **internes ou externes**.

Les éléments internes sont ceux qui appartiennent à l'acteur et dont les valeurs diffèrent entre différents acteurs, voici deux exemples :

- Nouvelles compétences secondaires : la valeur d'une compétence appelée "Cuisine" peut être différente d'un acteur à l'autre.
- Archétypes : chaque acteur peut avoir un archétype différent.

Les éléments externes sont ceux qui pourraient être réutilisés entre les acteurs, l'exemple le plus classique étant les armes. Les armes peuvent être utilisées par différents acteurs indépendamment, comme une épée par exemple.

### 2. Ajouter l'item au fichier template.json

**REMARQUE : Si vous avez décidé que votre item soit interne, passez cette étape**

Le fichier `template.json` contient les informations sur notre acteur. L'un des éléments qu'il contient concerne les éléments que nous pouvons créer dynamiquement pour l'acteur.

Il se trouve presque à la fin du fichier, avec une clé `"Item"` suivie des éléments possibles à ajouter : `types`.

Au moment de la rédaction de ce document, les types sont les suivants :

```json
{
  "Item": {
    "types": ["spell", "advantage"]
  }
}
```

Une fois que la clé de notre nouvel élément a été ajoutée au tableau, nous pouvons continuer.

**REMARQUE :** Le nom de l'élément ne doit pas contenir de caractères spéciaux tels que des barres obliques ou des tirets.

Un peu plus bas, nous définirons le contenu du `data` que notre élément aura, s'il n'a que le "nom", il n'est pas nécessaire de remplir ce qui suit. Voici deux exemples :

```json
{
  "spell": {
    "level": 0
  }
}
```

Si vous observez, `advantage` n'a pas de `data` défini, car Foundry nous fournit par défaut le nom en tant que champ externe dans ses données (et il est obligatoire).

Nous ajoutons le nôtre ci-dessous, et il ne nous reste qu'une étape : choisir où stocker nos nouveaux items dans les données de l'acteur. Par exemple, si nous recherchons `spell`, il sera situé sous `mystic`, l'un des champs de notre acteur.

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

Une fois cela fait, c'est terminé, nous avons fini avec `template.json`.

### 3. Ajouter le nom de l'item à ABFItems

Il existe un fichier appelé `ABFItems` qui contient tous les items pouvant être créés. Ici, nous créerons une nouvelle entrée dont la valeur devra être identique au nom que nous lui avons donné dans `template.json` s'il est externe, ou le nom que nous souhaitons s'il est interne.

Par exemple, pour les sorts créés librement :

```ts
export enum ABFItems {
  SPELL = 'spell'
}
```

### 4. Ajouter la configuration de l'item

Toutes les informations sur les champs à créer sont documentées dans le fichier `Items.d.ts`, où vous trouverez également les types de toutes les configurations à utiliser avec JSDoc. La première étape consiste à créer ces types pour vos items en vous basant sur ceux déjà existants.

Dans le dossier `module/types`, vous trouverez plusieurs sous-dossiers faisant référence à l'emplacement de ces items, par exemple : `mystic` ou `psychic`.

Une fois que vous avez localisé (ou créé s'il n'existe pas encore) le dossier qui hébergera la configuration du nouvel item, créez un fichier en utilisant comme exemple le `[...]ItemConfig` déjà créé pour l'item qui ressemble le plus au nouveau que vous souhaitez ajouter. En d'autres termes, si votre item est interne et ne comporte qu'un nom, choisissez un `[...]ItemConfig` qui soit interne et ne comporte qu'un nom (comme `ContactItemConfig`), tandis que si votre item est externe et comporte plus de données (comme une arme), choisissez un `[...]ItemConfig` approprié (comme `WeaponItemConfig`).

> :warning: *Remarque : Il est important de prendre en compte si l'item est interne ou externe lors de la création du fichier de configuration du nouvel item. En général, les tâches de modification, de création et de suppression d'items d'un acteur dépendent du fait que l'élément soit interne ou externe, et les méthodes correspondantes de la classe acteur doivent être appelées à cet effet. Pour un exemple de cela, comparez la méthode `onCreate` dans `AdvantageItemConfig` avec la même méthode dans `NoteItemConfig`.*

### 5. Ajouter notre item à la liste des items disponibles

Dans le fichier `module/actor/utils/prepareSheet/prepareItems/constants.ts`, vous trouverez deux objets : `INTERNAL_ITEM_CONFIGURATION` et `ITEM_CONFIGURATIONS`.

Ajoutez notre nouvelle configuration d'item à l'un de ces deux objets.

#### 6. Ajouter, s'il s'agit d'un élément externe, son type à Foundry

**REMARQUE : Cette étape concerne uniquement les items externes**

Dans le fichier `animabf.types.ts`, vous trouverez un type composite appelé `ABFItemsDataSource`. Vous devrez y ajouter notre nouvelle source de données pour l'élément.

### 7. Ajouter nos items HTML

Pour cela, il est préférable de suivre l'exemple d'autres éléments dynamiques, comme les sorts par exemple : [https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/blob/develop/src/templates/parts/mystic/parts/spells.hbs](https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/blob/develop/src/templates/parts/mystic/parts/spells.hbs)

Il existe plusieurs composants réutilisables. Je recommande de lire différents morceaux de code HBS pour mieux les comprendre.

## C'est fini

Si vous avez suivi toutes les étapes correctement, vous devriez avoir votre nouvel élément prêt. Si vous avez des questions, n'hésitez pas à me les poser sur Discord : **@Linkaynn**.
