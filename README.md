# AnimaBeyondFoundry

// Instrucciones para desarrolladores

- Clonar el repositorio en \AppData\Local\FoundryVTT\Data\systems (es decir, en ese directorio se creará la carpeta AnimaBeyondFoundry con el repositorio)

- Instalar node si no lo tienes: https://nodejs.org/en/download/

- Abrir un powershell en el directorio del proyecto (...\FoundryVTT\Data\systems\AnimaBeyondFoundry) y ejecutar el comando:

`npm run-script build:watch`

También se puede usar la terminal del VScode: Con la carpeta del repositorio en el worskpace, botón de recho sobre ella y Open in integrated Terminal.

Este comando compila el proyecto y crea la carpeta del sistema listo para ser leído por Foundry: ...\FoundryVTT\Data\systems\animabf

Mientras la terminal siga corriendo con ese comando, cualquier cambio que se haga en la carpeta del repositorio prvocará que se recompile el proyecto y actualize la carpet animabf.

- Para ver los cambios en Foundry, por lo general basta con pulsar f5 dentro del mundo una vez el proyecto haya compilado. Si no, Opciones -> Return to setup y cargar de nuevo el mundo.

