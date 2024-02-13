# Comment publier une nouvelle version du système

1. Mettez à jour le numéro de version dans `package.json`, ligne 4. Suivez la convention [semver](https://semver.org/lang/fr/).
   - **Remarque : Il n'est pas nécessaire de commit ces changements, mais assurez-vous de ne pas inclure d'autres modifications non désirées.**

2. Exécutez `npm run release`. La console vous guidera :
   - Tout d'abord, il vous sera demandé si vous êtes sûr de vouloir publier ce numéro de version, de vous assurer qu'il n'existe pas déjà, etc. Pour accepter, appuyez sur Entrée. Cela générera un fichier `animabf.zip` dans le dossier `AnimaBeyondFoundry/package/` (qui sera également créé à ce moment-là).
   - La console vous fournira un lien GitHub où vous devrez télécharger le fichier zip généré précédemment. Faites-le en ajoutant des commentaires expliquant les raisons de la mise à jour, puis cliquez sur **Publish release** (Publier la version).
   - Revenez à la console et appuyez à nouveau sur Entrée pour finaliser le processus.
   - Poussez (**Push**) les changements, qui devraient concerner `package.json` et `src/system.json`.
