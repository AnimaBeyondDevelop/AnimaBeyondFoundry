# Ventajas de usar el FoundryVtt-cli

La principal ventaja es poder centralizar en una sola herramienta los paths de instalación y de datos de foundry. Así, con hacer

```bash
fvtt configure set installPath "/path/to/foundry/install"
fvtt configure set dataPath "/path/to/foundry/data"
```

El CLI registra los paths correspondientes y para lanzar foundry tan sólo tendremos que hacer

```bash
fvtt launch
```

sin necesidad de indicar los paths cada vez que queramos lanzar foundry.

Además, el foundry provee comandos para obtener dichos paths una vez establecidos:

```bash
fvtt configure get installPath # prints /path/to/foundry/install
fvtt configure get dataPath # prints /path/to/foundry/data
```

Esto es útil para construir la ruta donde deben ir los sistemas, por ejemplo, y copiar allí el sistema una vez hecha la build. En concreto, si se encuentra instalado, no será necesario crear el archivo `foundryconfig.json` para especificar el `dataPath`, sino que se obtendrá a través del CLI.

# Instalación

La instalación es sencilla: se hace usando npm. Conviene instalarlo globalmente para tenerlo accesible desde la línea de comandos:

```bash
npm install -g @foudryvtt/foundryvtt-cli
```

Tras esto, sólo tendremos que configurar los paths como arriba y comprobar nuestra configuración haciendo `fvtt configure` (obtendremos un `configuration complete!` si está todo correcto).

# Selector de versiones

Si se instala el CLI, es posible tener un selector de versiones para cambiar entre las instaladas. En concreto, podemos tener la instalación de Foundry siguiendo esta estructura de carpetas:

```
/home/<user>
├── data
│  ├── v11
│  └── v12
└── installations
   ├── v11
   └── v12
```

En este caso, podemos valernos de ésta para crear una utilidad que nos permita cambiar de versiones de manera fácil:

Copiando el código anterior a un archivo guardado en algún sitio en el path (por ejemplo `~/.local/bin/fvtt-config`) y dándole permisos de ejecución si es necesario (`chmod +x ~/.local/bin/fvtt-config`), deberíamos poder lanzar fvtt-config, que nos permitirá seleccionar una de las versiones instaladas y establecerá los paths correspondientes.

> _Nota: aunque no es necesario, si fzf está instalado se usa para seleccionar la versión permitiéndonos buscar entre las disponibles._

```bash
#!/usr/bin/bash

if ! [ -x "$(command -v fvtt)" ]
then
  echo "Error: fvtt not available."
  echo "Please install it with 'npm install -g @foundryvtt/foundryvtt-cli'"
  exit 1
fi

installPath=$HOME/foundry/installations

if [ -x "$(command -v fzf)" ]
then
  version=$(ls $installPath | fzf --reverse --info=inline --height=10%)
else
  PS3="Select your version: "
  select installation in $installPath/*
  do
    version=${installation#*installations/}
    break
  done
fi

if [ -z "$version" ]
then
  echo "No changes!"
  fvtt configure view
else
  fvtt configure set installPath "$HOME/foundry/installations/$version"
  fvtt configure set dataPath "$HOME/foundry/data/${version%.*}"
fi
```
