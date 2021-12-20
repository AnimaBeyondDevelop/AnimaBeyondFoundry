# Cypress Integration Tests

Cypress es una herramienta que permite testear íntegramente un sitio web o una aplicación web. Dicho en otras palabras: emula las acciones que nosotros le digamos sobre distintos elementos y le decimos que es lo que debe esperar, por ejemplo:

```js
// cy es la forma que tenemos de interactuar con cypress

cy.visit('http://localhost:30000') // Le pedimos a Cypress que visite esa URL, la cual contiene la interfaz Foundry

cy.get('button[type="submit"]').click(); // También que busque un botón con de tipo "submit" y le haga click

cy.get('h3').should('have.text', 'Anima Beyond Foundry'); // Por último comprueba que un H3 contiene un nombre dado
```

El propósito que tienen los test de integración es de asegurarse de que todo el módulo funciona correctamente.

## Lanzar los tests

**TL;DR**

- Copiamos `cypress.env.example.json` a `cypress.env.json` y configuramos los campos
- `npm run cypress:open`

**Nota importante: Lanzar los test de cypress te creará mundos con nombres aleatorios, tendrás que borrarlos manualmente tras lanzar los tests**

### Fichero de configuración

Para lanzar los test primero tenemos que copiar el fichero `cypress.env.example.json` y cambiarle el nombre a `cypress.env.json`. Dentro del fichero `cypress.env.json` rellenamos los siguientes campos:

- `foundryAdminPassword`: Es la contraseña de administrador que usas en Foundry para poder volver a la lista de mundos o loguearte como administrador

Nota: El fichero `cypress.env.json` se encuentra ignorado en el `.gitignore` por lo que no te preocupes, tus credenciales nunca se van a subir al repositorio sin querer

### Abrir Cypress

Si hacemos `npm run cypress:open` abriremos la interfaz de Cypress, allí nos aparecerán todos los tests disponibles a lanzar. Hacemos click en el que queramos y listo.

