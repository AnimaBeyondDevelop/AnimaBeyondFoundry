# Cómo publicar una nueva versión del sistema

1. Actualizar el número de versión en `package.json` línea 4. Seguimos la convención [semver](https://semver.org/lang/es/).
   - **Nota: No es necesario hacer commit con estos cambios, pero asegúrate de que no introduces otros cambios no deseados.**
2. Lanzar `npm run release`. La propia consola te va guiando:
   - Primero te pregunta si estás seguro de que quieres publicar ese número de versión, que te asegures de que no existe ya, etc... Para aceptar, pulsa Enter. Eso generará un archivo `animabf.zip` en la carpeta `AnimaBeyondFoundry/package/` (que será creada también en ese momento).
   - La consola te da un enlace de github donde debes subir el zip generado anteriormente. Hazlo, añadiendo comentarios con los motivos del update, y haz clic en **Publish release**.
   - Vuelve a la consola, y pulsa Enter una vez más para que se complete el proceso.
   - Pushea los cambios, que deberían ser en `package.json` y en `src/system.json`
