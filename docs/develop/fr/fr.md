## Instructions d'installation pour les développeurs

Ces étapes sont recommandées pour travailler avec Linux. Si vous utilisez Windows, vous devriez installer [WSL2](https://learn.microsoft.com/fr-fr/windows/wsl/install), configurer VSCode pour travailler avec WSL et suivre les étapes de Linux.

>:warning: *Si vous configurez pour travailler avec WSL, nous vous recommandons de ne pas utiliser l'installation de Foundry sous Windows et d'installer Foundry sous WSL à partir du terminal en suivant les étapes de la section "Hosting a Dedicated Server with NodeJS" dans le [guide d'installation de Foundry]((https://foundryvtt.com/article/installation/)). Il est possible d'utiliser une installation existante sous Windows, auquel cas il serait recommandé de séparer les dossiers de données de Foundry pour le développement et la production.*

1) Clonez le dépôt dans l'emplacement qui vous convient le mieux. Dans Sourcetree, cela se fait via File -> Clone, et en utilisant la console :
```bash
git clone https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry.git

```

2) Installez Node(18) si ce n'est pas déjà fait : https://nodejs.org/en/download/

3) Dans VSCode, ajoutez le dossier du référentiel à l'espace de travail (clic droit sur le panneau de gauche et "Ajouter un dossier à l'espace de travail", par exemple). Ensuite, faites un clic droit dessus et "Ouvrir dans le terminal intégré". Cela ouvre un terminal de commandes Windows dans ce répertoire (...\FoundryVTT\Data\systems\AnimaBeyondFoundry). Dans ce terminal, exécutez la commande :

`npm install`

> :warning: *Si vous utilisez WSL, pour ouvrir le dossier du dépôt dans VSCode, vous devrez suivre les étapes décrites ici. Le moyen le plus simple est de naviguer depuis la console jusqu'au dossier du dépôt et d'exécuter  `code .`.*

4) Dupliquez le fichier `foundryconfig.example.json`, renommez-le `foundryconfig.json`, puis éditez-le et remplissez le champ destPath avec le chemin où se trouve le dossier des systèmes, par exemple :
   4.1. Windows: `C:/Users/<nomdutilisateur>/AppData/Local/FoundryVTT/Data/systems`
   4.2. Linux: `/home/<nomdutilisateur>/.local/share/FoundryVTT/Data/systems`
   4.3. WSL (installation du serveur) : `/home/<nomdutilisateur>/foundrydata/Data/Systems`

5) Jusqu'à présent, ce dossier n'a aucun effet sur Foundry. Pour générer le vrai dossier du système, exécutez la commande :

`npm run build:dev`, pour générer uniquement le dossier, ou

`npm run dev`, pour le générer et le régénérer en cas de changements dans le dossier du référentiel.

6) Ouvrez Foundry. Vous devriez voir Anima Beyond Fantasy parmi vos systèmes installés.
> :warning: * Si vous utilisez WSL et que vous avez suivi les étapes pour installer Foundry décrites dans la section "Hosting a Dedicated Server with NodeJS" dans le [guide d'installation de Foundry](https://foundryvtt.com/article/installation/),  vous devrez lancer Foundry depuis la console avec la commande suivante :*
> ```bash
> node $HOME/foundryvtt/resources/app/main.js --dataPath=$HOME/foundrydata`
> ```
> *Pour plus de commodité, vous pouvez créer un alias avec :*
>```bash
> echo "alias foundry='node $HOME/foundryvtt/resources/app/main.js --dataPath=$HOME/foundrydata'" >> ~/.bash_aliases
>```
> *Après avoir créé l'alias (et redémarré la console pour qu'il prenne effet), il vous suffira d'utiliser la commande `foundry` pour le lancer. Pour vous connecter, ouvrez simplement n'importe quel navigateur et accédez à l'URL `localhost:30000`.*

## Instructions de travail pour les développeurs

a) Pour commencer à travailler sur quelque chose qui n'est pas déjà en cours :

1) Placez-vous sur la branche DEVELOP. 
	-Dans Sourcetree, la première fois, allez dans le panneau de gauche, >Remotes>background>, puis double-cliquez sur la branche sur laquelle vous souhaitez vous positionner. Une fois fait, la branche que vous venez de choisir apparaîtra dans le panneau de gauche, dans >Branches> (les branches qui apparaissent dans >Branches> sont locales, et celles qui sont dans >Remote> sont sur GitHub).
	-Les fois suivantes, lorsque vous aurez déjà Develop dans le menu déroulant >Branches>, double-cliquez simplement dessus pour vous y positionner.

2) Assurez-vous d'avoir la version la plus récente du référentiel : Bouton FETCH, et si des changements sont détectés, Bouton PULL.

3) Créez une nouvelle branche à partir de develop. Dans Sourcetree, cela se fait dans le bouton Branches à côté de Fetch. Choisissez un nom descriptif pour la tâche que vous allez effectuer dans cette branche, pour que tout le monde comprenne sur quoi vous travaillez.

4) Positionnez-vous sur la branche sur laquelle vous allez travailler (celle que vous venez de créer).

5) Effectuez des modifications : Dans VSCode, ouvrez le terminal dans le dossier du référentiel et exécutez la commande :

`npm run dev`

Tant que le terminal exécute cette commande, tout changement apporté au dossier du référentiel recompilera le projet et mettra à jour le dossier animabf.
- Pour voir les modifications dans Foundry, en général, appuyez simplement sur F5 à l'intérieur du monde une fois que le projet est compilé. Sinon, Options -> Return to setup, puis rechargez le monde.

6) Lorsque votre travail est terminé, ou lorsque vous voulez enregistrer vos avancées, faites un commit sur la branche sur laquelle vous vous trouvez. Dans Sourcetree, cela se fait dans le bouton COMMIT en haut à gauche. Ensuite, Staged files et Unstaged files apparaîtront. Ajoutez les fichiers que vous souhaitez enregistrer, ajoutez un commentaire descriptif de ce que vous avez fait en bas, puis cliquez sur Commit en bas à droite.

7) Si vous n'avez pas coché la case "Push Inmediately..." lors du commit, vous verrez que le bouton Push s'allume. Assurez-vous d'être effectivement sur la branche appropriée, puis cliquez sur le bouton PUSH.

8) Lorsque le travail sur une fonctionnalité donnée est complètement terminé, ouvrez Git et faites une PULL REQUEST depuis votre branche vers develop, puis désignez certains collègues comme reviewers pour qu'ils examinent votre code avant de l'accepter. Si vous avez des questions, demandez sur Discord.

9) De temps en temps, lorsque la branche Develop a connu de nombreux changements, une fusion (MERGE) de la branche develop vers la branche master sera effectuée. Encore une fois, cela devrait se faire avec le consensus de plusieurs personnes.

b) Pour continuer votre travail ou le travail d'un autre : Faites la même chose que précédemment, mais sans les étapes 1 et 3.

## Liens utiles

- [Comment publier une nouvelle version du système](publish-new-version.md)
- [Comment créer un nouveau type d'item](add-new-item.md)
- [Test en Cypress](cypress_integration_tests.md)