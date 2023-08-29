## Instructions d'installation pour les développeurs

Ces étapes sont recommandées pour travailler avec Linux. Si vous utilisez Windows, vous devriez installer [WSL2](https://learn.microsoft.com/fr-fr/windows/wsl/install) et suivre les étapes de Linux.

1) Cloner le référentiel dans \AppData\Local\FoundryVTT\Data\systems\AnimaBeyondFoundry. Dans Sourcetree, cela se fait via Fichier -> Cloner.

2) Installer node (18) si ce n'est pas déjà fait : https://nodejs.org/en/download/

3) Dans VSCode, ajouter le dossier du référentiel à l'espace de travail (clic droit sur le panneau de gauche et "Ajouter un dossier à l'espace de travail", par exemple). Ensuite, faites un clic droit dessus et "Ouvrir dans le terminal intégré". Cela ouvre un terminal de commandes Windows dans ce répertoire (...\FoundryVTT\Data\systems\AnimaBeyondFoundry). Dans ce terminal, exécutez la commande :

`npm install`

4) Dupliquez le fichier foundryconfig.example.json et renommez-le foundryconfig.json, puis éditez-le et remplissez le champ destPath avec le chemin où vous avez le dossier des systèmes, par exemple :
   4.1. Windows: `C:/Users/<nomdutilisateur>/AppData/Local/FoundryVTT/Data/systems`
   4.2. Linux: `/home/<nomdutilisateur>/.local/share/FoundryVTT/Data/systems`


5) Jusqu'à présent, ce dossier n'a aucun effet sur Foundry. Pour générer le vrai dossier du système, exécutez la commande :

`npm run build:dev`, pour générer uniquement le dossier, ou

`npm run dev`, pour le générer et le régénérer en cas de changements dans le dossier du référentiel.

6) Ouvrez Foundry. Vous devriez voir Anima Beyond Fantasy parmi vos systèmes installés.

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
