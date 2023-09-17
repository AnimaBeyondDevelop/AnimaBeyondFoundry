## Instrucciones de instalación para desarrolladores

Estos pasos están recomendados para trabajar con Linux, si usas Windows, deberías instalar [WSL2](https://learn.microsoft.com/es-es/windows/wsl/install) y [configurar VSCode para trabajar con WSL](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode) y seguir los pasos de Linux.

> :warning: *Si estás configurando para trabajar con WSL, recomendamos no usar la instalación de Foundry en windows y en su lugar instalar Foundry en WSL desde la terminal siguiendo los pasos en el apartado "Hosting a Dedicated Server with NodeJS" en la [guía de instalación de Foundry](https://foundryvtt.com/article/installation/). Usar una instalación existente en Windows es posible, en cuyo caso sería recomendable tener separadas las carpetas de los datos de foundry para desarrollo y producción.*

1) Clonar el repositorio en la ubicación que resulte más conveniente. En Sourcetree esto se hace en File-> Clone, y desde la consola:
```bash
git clone https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry.git

```

2) Instalar node (18) si no lo tienes: https://nodejs.org/en/download/

3) En VSCode, añadir la carpeta del repositorio al worskpace (botón derecho en el panel izquierda y "Add folder to workspace" por ejemplo). Luego, hacer clic derecho sobre ella y "Open in integrated terminal". Eso abre una terminal de comandos de windows en dicho directorio (...\FoundryVTT\Data\systems\AnimaBeyondFoundry). En esa terminal se debe ejecutar el comando:

`npm install`

> :warning: *Si estás usando WSL, para abrir la carpeta del repositorio en VSCode deberás seguir los pasos [aquí](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode#open-a-wsl-project-in-visual-studio-code). Lo más sencillo es navegar desde la terminal a la carpeta del repositorio y lanzar `code .`.*

4) Duplica el fichero `foundryconfig.example.json` y renómbralo a `foundryconfig.json`, luego edítalo y el campo `destPath` rellénalo con la ruta donde tengas la carpeta de sistemas, por ejemplo:
   4.1. Windows: `C:/Users/<nombredeUsuario>/AppData/Local/FoundryVTT/Data/systems`
   4.2. Linux: `/home/<nombredeUsuario>/.local/share/FoundryVTT/Data/systems`
   4.3. WSL (server installation): `/home/<nombredeUsuario>/foundrydata/Data/Systems`

4) Hasta ahora esta carpeta no tiene ningún efecto sobre Foundry. Para generar la carpeta real del sistema, ejecutamos el comando:

`npm run build:dev`, para generarla sin más, o

`npm run dev`, para generarla y que además se vuelva a generar si hacemos algún cambio en la carpeta del repositorio.

5) Abrir Foundry. Deberíamos ver Anima Beyond Fantasy entre nuestros sistemas instalados.
> :warning: *Si estás usando WSL y has seguido los pasos para instalar Foundry descritos en el apartado "Hosting a Dedicated Server with NodeJS" en la [guía de instalación de Foundry](https://foundryvtt.com/article/installation/), deberás lanzar foundry desde la terminal con*
> ```bash
> node $HOME/foundryvtt/resources/app/main.js --dataPath=$HOME/foundrydata`
> ```
> *Por comodidad, puede crearse un alias con*
>```bash
> echo "alias foundry='node $HOME/foundryvtt/resources/app/main.js --dataPath=$HOME/foundrydata'" >> ~/.bash_aliases
>```
> *Tras crear el alias (y reiniciar la terminal para que surta efecto), bastará con usar el comando `foundry` para lanzarlo. Para conectarse habrá que abrir cualquier explorador y abrir la url `localhost:30000`.*

## Instrucciones de trabajo para desarrolladores

a) Para empezar a trabajar en algo en lo que no se esté trabajando ya:

1) Nos colocamos en la rama DEVELOP.
   -En Sourcetree, la primera vez, tenemos que ir al panel de la izquierda, a >Remotes>background> y hacer doble click en la rama en la que queremos colocarnos. Al hacerlo veremos como ahora en el panel de la izquierda, en >Branches, aparece la rama en la que acabamos de colocarnos (las ramas que aparecen en >Branches son las que tenemos en local, y las que están en >Remote son las que están en GitHub).
- Las siguientes veces, cuando ya tengamos Develop en el desplegable de >Branches, pues simplemente hacemos doble clic ahí para colocarnos en ella.

2) Nos aseguramos de que tenemos la versión más actualizada del repositorio: Botón FETCH, y en caso de que se detecte algún cambio Botón PULL.

3) Creamos una nueva rama desde develop. En Sourcetree esto se hace en el botón Branches que hay junto a Fetch. Poned un nombre descriptivo del trabajo que se va a realizar en esa rama, para que todos entendamos qué se está haciendo y qué no

4) Nos colocamos en la rama en la que vamos a trabajar (la que acabamos de crear).

5) Programar cosas: En VSCode, abre la terminal en la carpeta del repositorio y ejecuta el comando:

`npm run dev`

Mientras la terminal siga corriendo con ese comando, cualquier cambio que se haga en la carpeta del repositorio provocará que se recompile el proyecto y actualize la carpeta animabf.
- Para ver los cambios en Foundry, por lo general basta con pulsar f5 dentro del mundo una vez el proyecto haya compilado. Si no, Opciones -> Return to setup y cargar de nuevo el mundo.

5) Cuando tu trabajo esté terminado, o cuando quieras guardar el progreso, haz un Commit en la rama en la que estás. En Sourcetree esto se hace en el botón COMMIT arriba a la izquierda. Al darle te salen Staged files y Unstaged files. Dale a Stage a los archivos que quieras guardar, añade abajo un comentario descriptivo de lo que has hecho y dale a Commit en la esquina inferior derecha.

6) Si no has marcado la casilla de "Push Inmediately..." al hacer el commit, verás que se ilumina el botón de Push. Comprueba que efectivamente estás en la rama en la que tienes que estar, y dale al botón PUSH.

7) Cuando el trabajo en una determinada feature esté terminado por completo, entramos en Git y hacemos un PULL REQUEST desde nuestra rama a develop, y marcamos a algunos de los compañeros como reviewers para que repasen nuestro código antes de aceptarlo. Los que tengáis dudas preguntad por Discord.

8) De vez en cuando, cuando la rama Develop haya tenido bastantes cambios, se hará un MERGE de la rama develop a la rama master. De nuevo, esto mejor que solo se haga con consenso entre varios.

b) Para continuar tu trabajo o el trabajo de otro: Lo mismo que lo anterior pero sin el paso 1 ni 3.

## Enlaces útiles

- [Cómo publicar una nueva versión del sistema](publish-new-version.md)
- [Cómo crear un nuevo tipo de item](add-new-item.md)
- [Test en Cypress](cypress_integration_tests.md)
