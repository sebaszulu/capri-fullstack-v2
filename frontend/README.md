# Hotel Capri Doradal - Frontend

El frontend está construido con [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [TanStack Query](https://tanstack.com/query), [TanStack Router](https://tanstack.com/router) y [Chakra UI](https://chakra-ui.com/).

## Desarrollo del Frontend

Antes de comenzar, asegúrate de tener instalado Node Version Manager (nvm) o Fast Node Manager (fnm) en tu sistema.

* Para instalar fnm sigue la [guía oficial de fnm](https://github.com/Schniz/fnm#installation). Si prefieres nvm, puedes instalarlo usando la [guía oficial de nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

* Después de instalar nvm o fnm, ve al directorio `frontend`:

```bash
cd frontend
```

* Si la versión de Node.js especificada en el archivo `.nvmrc` no está instalada en tu sistema, puedes instalarla usando el comando apropiado:

```bash
# Si usas fnm
fnm install

# Si usas nvm
nvm install
```

* Una vez completada la instalación, cambia a la versión instalada:

```bash
# Si usas fnm
fnm use

# Si usas nvm
nvm use
```

* Dentro del directorio `frontend`, instala los paquetes NPM necesarios:

```bash
npm install
```

* E inicia el servidor en vivo con el siguiente script de `npm`:

```bash
npm run dev
```

* Luego abre tu navegador en http://localhost:5173/.

Ten en cuenta que este servidor en vivo no se ejecuta dentro de Docker, es para desarrollo local, y ese es el flujo de trabajo recomendado. Una vez que estés satisfecho con tu frontend, puedes construir la imagen Docker del frontend e iniciarla, para probarla en un ambiente similar a producción. Pero construir la imagen en cada cambio no será tan productivo como ejecutar el servidor de desarrollo local con recarga en vivo.

Revisa el archivo `package.json` para ver otras opciones disponibles.

### Eliminar el Frontend

Si estás desarrollando una app solo de API y quieres eliminar el frontend, puedes hacerlo fácilmente:

* Elimina el directorio `./frontend`.

* En el archivo `docker-compose.yml`, elimina todo el servicio / sección `frontend`.

* En el archivo `docker-compose.override.yml`, elimina todo el servicio / sección `frontend` y `playwright`.

Listo, tienes una app sin frontend (solo API). 🤓

---

Si quieres, también puedes eliminar las variables de entorno de `FRONTEND` de:

* `.env`
* `./scripts/*.sh`

Pero sería solo para limpiarlas, dejarlas no tendrá ningún efecto de todos modos.

## Generar Cliente

### Automáticamente

* Activa el entorno virtual del backend.
* Desde el directorio principal del proyecto, ejecuta el script:

```bash
./scripts/generate-client.sh
```

* Haz commit de los cambios.

### Manualmente

* Inicia el stack de Docker Compose.

* Descarga el archivo JSON de OpenAPI desde `http://localhost/api/v1/openapi.json` y cópialo a un nuevo archivo `openapi.json` en la raíz del directorio `frontend`.

* Para generar el cliente del frontend, ejecuta:

```bash
npm run generate-client
```

* Haz commit de los cambios.

Ten en cuenta que cada vez que el backend cambie (cambiando el esquema OpenAPI), debes seguir estos pasos de nuevo para actualizar el cliente del frontend.

## Usar una API Remota

Si quieres usar una API remota, puedes establecer la variable de entorno `VITE_API_URL` a la URL de la API remota. Por ejemplo, puedes establecerla en el archivo `frontend/.env`:

```env
VITE_API_URL=https://api.mi-dominio.ejemplo.com
```

Luego, cuando ejecutes el frontend, usará esa URL como URL base para la API.

## Estructura del Código

El código del frontend está estructurado de la siguiente manera:

* `frontend/src` - El código principal del frontend.
* `frontend/src/assets` - Recursos estáticos.
* `frontend/src/client` - El cliente OpenAPI generado.
* `frontend/src/components` - Los diferentes componentes del frontend.
  * `frontend/src/components/Admin` - Componentes de administración de usuarios.
  * `frontend/src/components/Bookings` - Componentes de gestión de reservas.
  * `frontend/src/components/Common` - Componentes comunes (Navbar, Sidebar, etc.).
  * `frontend/src/components/Rooms` - Componentes de gestión de habitaciones.
  * `frontend/src/components/RoomTypes` - Componentes de tipos de habitación.
  * `frontend/src/components/UserSettings` - Componentes de configuración de usuario.
  * `frontend/src/components/ui` - Componentes de UI personalizados de Chakra.
* `frontend/src/hooks` - Custom hooks.
* `frontend/src/routes` - Las diferentes rutas del frontend que incluyen las páginas.
* `theme.tsx` - El tema personalizado de Chakra UI.

## Tests End-to-End con Playwright

El frontend incluye tests end-to-end iniciales usando Playwright. Para ejecutar los tests, necesitas tener el stack de Docker Compose funcionando. Inicia el stack con el siguiente comando:

```bash
docker compose up -d --wait backend
```

Luego, puedes ejecutar los tests con el siguiente comando:

```bash
npx playwright test
```

También puedes ejecutar tus tests en modo UI para ver el navegador e interactuar con él:

```bash
npx playwright test --ui
```

Para detener y eliminar el stack de Docker Compose y limpiar los datos creados en los tests, usa el siguiente comando:

```bash
docker compose down -v
```

Para actualizar los tests, navega al directorio de tests y modifica los archivos de test existentes o añade nuevos según sea necesario.

Para más información sobre escribir y ejecutar tests de Playwright, consulta la [documentación oficial de Playwright](https://playwright.dev/docs/intro).

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run lint` | Ejecuta el linter (Biome) |
| `npm run preview` | Previsualiza la build de producción |
| `npm run generate-client` | Genera el cliente API desde OpenAPI |
