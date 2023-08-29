# Tests d'intégration Cypress

Cypress est un outil qui permet de tester de manière exhaustive un site web ou une application web. En d'autres termes, il émule les actions que nous lui demandons sur différents éléments et nous disons ce qu'il doit attendre, par exemple :


```// cy est la manière dont nous interagissons avec Cypress

cy.visit('http://localhost:30000') // Nous demandons à Cypress de visiter cette URL, qui contient l'interface Foundry

cy.get('button[type="submit"]').click(); // Nous demandons également de rechercher un bouton de type "submit" et de cliquer dessus

cy.get('h3').should('have.text', 'Anima Beyond Foundry'); // Enfin, nous vérifions qu'un H3 contient un nom donné

```

Le but des tests d'intégration est de s'assurer que le module fonctionne correctement.


## Lancement des tests

**TL;DR**

- Copiez `cypress.env.example.json` en `cypress.env.json` et configurez les champs.
- `npm run cypress:open`

**Note importante : Lancer les tests Cypress créera des mondes avec des noms aléatoires. Vous devrez les supprimer manuellement après avoir exécuté les tests.**

### Fichier de configuration

Pour lancer les tests, nous devons d'abord copier le fichier `cypress.env.example.json` et le renommer en `cypress.env.json`. À l'intérieur du fichier `cypress.env.json`, remplissez les champs suivants :

- `foundryAdminPassword`: C'est le mot de passe d'administrateur que vous utilisez dans Foundry pour revenir à la liste des mondes ou vous connecter en tant qu'administrateur.

Note : Le fichier `cypress.env.json` est ignoré dans le `.gitignore`, vous n'avez donc pas à vous inquiéter, vos informations d'identification ne seront jamais téléchargées accidentellement dans le référentiel.

### Ouvrir Cypress

Si nous exécutons `npm run cypress:open`, nous ouvrirons l'interface de Cypress. Tous les tests disponibles à exécuter y seront affichés. Cliquez sur celui que vous souhaitez et c'est parti.
