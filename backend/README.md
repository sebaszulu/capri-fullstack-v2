# Hotel Capri Doradal - Backend

## Requisitos

* [Docker](https://www.docker.com/)
* [uv](https://docs.astral.sh/uv/) para gestión de paquetes y entornos de Python.

## Docker Compose

Inicia el entorno de desarrollo local con Docker Compose siguiendo la guía en [../development.md](../development.md).

## Flujo de Trabajo General

Por defecto, las dependencias se gestionan con [uv](https://docs.astral.sh/uv/), visita la página e instálalo.

Desde `./backend/` puedes instalar todas las dependencias con:

```console
$ uv sync
```

Luego puedes activar el entorno virtual con:

```console
$ source .venv/bin/activate
```

Asegúrate de que tu editor esté usando el entorno virtual de Python correcto, con el intérprete en `backend/.venv/bin/python`.

Modifica o añade modelos SQLModel para datos y tablas SQL en `./backend/app/models.py`, endpoints de API en `./backend/app/api/`, utilidades CRUD (Crear, Leer, Actualizar, Eliminar) en `./backend/app/crud.py`.

## VS Code

Ya hay configuraciones listas para ejecutar el backend a través del depurador de VS Code, para que puedas usar puntos de interrupción, pausar y explorar variables, etc.

La configuración también está lista para que puedas ejecutar los tests a través de la pestaña de tests de Python de VS Code.

## Docker Compose Override

Durante el desarrollo, puedes cambiar configuraciones de Docker Compose que solo afectarán al entorno de desarrollo local en el archivo `docker-compose.override.yml`.

Los cambios en ese archivo solo afectan al entorno de desarrollo local, no al entorno de producción. Así puedes añadir cambios "temporales" que ayuden al flujo de trabajo de desarrollo.

Por ejemplo, el directorio con el código del backend está sincronizado en el contenedor Docker, copiando el código que cambias en vivo al directorio dentro del contenedor. Eso te permite probar tus cambios inmediatamente, sin tener que reconstruir la imagen de Docker. Esto solo debe hacerse durante el desarrollo; para producción, debes construir la imagen de Docker con una versión reciente del código del backend. Pero durante el desarrollo, te permite iterar muy rápido.

También hay un comando override que ejecuta `fastapi run --reload` en lugar del predeterminado `fastapi run`. Inicia un solo proceso de servidor (en lugar de múltiples, como sería para producción) y recarga el proceso cada vez que el código cambia. Ten en cuenta que si tienes un error de sintaxis y guardas el archivo Python, se romperá y saldrá, y el contenedor se detendrá. Después de eso, puedes reiniciar el contenedor corrigiendo el error y ejecutando de nuevo:

```console
$ docker compose watch
```

También hay un comando `command` comentado, puedes descomentarlo y comentar el predeterminado. Hace que el contenedor del backend ejecute un proceso que no hace "nada", pero mantiene el contenedor vivo. Eso te permite entrar en tu contenedor en ejecución y ejecutar comandos dentro, por ejemplo un intérprete de Python para probar dependencias instaladas, o iniciar el servidor de desarrollo que recarga cuando detecta cambios.

Para entrar en el contenedor con una sesión `bash` puedes iniciar el stack con:

```console
$ docker compose watch
```

y luego en otra terminal, `exec` dentro del contenedor en ejecución:

```console
$ docker compose exec backend bash
```

Deberías ver una salida como:

```console
root@7f2607af31c3:/app#
```

esto significa que estás en una sesión `bash` dentro de tu contenedor, como usuario `root`, bajo el directorio `/app`, este directorio tiene otro directorio llamado "app" dentro, ahí es donde vive tu código dentro del contenedor: `/app/app`.

Allí puedes usar el comando `fastapi run --reload` para ejecutar el servidor con recarga en vivo.

```console
$ fastapi run --reload app/main.py
```

...se verá así:

```console
root@7f2607af31c3:/app# fastapi run --reload app/main.py
```

y luego presiona enter. Eso ejecuta el servidor con recarga en vivo que se recarga automáticamente cuando detecta cambios de código.

Sin embargo, si no detecta un cambio sino un error de sintaxis, simplemente se detendrá con un error. Pero como el contenedor sigue vivo y estás en una sesión Bash, puedes reiniciarlo rápidamente después de corregir el error, ejecutando el mismo comando ("flecha arriba" y "Enter").

...este detalle anterior es lo que hace útil tener el contenedor vivo sin hacer nada y luego, en una sesión Bash, hacer que ejecute el servidor con recarga en vivo.

## Tests del Backend

Para probar el backend ejecuta:

```console
$ bash ./scripts/test.sh
```

Los tests se ejecutan con Pytest, modifica y añade tests en `./backend/tests/`.

Si usas GitHub Actions los tests se ejecutarán automáticamente.

### Ejecutar Tests con el Stack Activo

Si tu stack ya está activo y solo quieres ejecutar los tests, puedes usar:

```bash
docker compose exec backend bash scripts/tests-start.sh
```

Ese script `/app/scripts/tests-start.sh` simplemente llama a `pytest` después de asegurarse de que el resto del stack está funcionando. Si necesitas pasar argumentos extra a `pytest`, puedes pasarlos a ese comando y serán reenviados.

Por ejemplo, para detenerse en el primer error:

```bash
docker compose exec backend bash scripts/tests-start.sh -x
```

### Cobertura de Tests

Cuando se ejecutan los tests, se genera un archivo `htmlcov/index.html`, puedes abrirlo en tu navegador para ver la cobertura de los tests.

## Migraciones

Como durante el desarrollo local tu directorio app está montado como un volumen dentro del contenedor, también puedes ejecutar las migraciones con comandos de `alembic` dentro del contenedor y el código de migración estará en tu directorio app (en lugar de estar solo dentro del contenedor). Así puedes añadirlo a tu repositorio git.

Asegúrate de crear una "revisión" de tus modelos y que "actualices" tu base de datos con esa revisión cada vez que los cambies. Esto es lo que actualizará las tablas en tu base de datos. De lo contrario, tu aplicación tendrá errores.

* Inicia una sesión interactiva en el contenedor del backend:

```console
$ docker compose exec backend bash
```

* Alembic ya está configurado para importar tus modelos SQLModel desde `./backend/app/models.py`.

* Después de cambiar un modelo (por ejemplo, añadir una columna), dentro del contenedor, crea una revisión, ej.:

```console
$ alembic revision --autogenerate -m "Añadir columna apellido al modelo Usuario"
```

* Haz commit al repositorio git de los archivos generados en el directorio alembic.

* Después de crear la revisión, ejecuta la migración en la base de datos (esto es lo que realmente cambiará la base de datos):

```console
$ alembic upgrade head
```

Si no quieres usar migraciones en absoluto, descomenta las líneas en el archivo `./backend/app/core/db.py` que terminan en:

```python
SQLModel.metadata.create_all(engine)
```

y comenta la línea en el archivo `scripts/prestart.sh` que contiene:

```console
$ alembic upgrade head
```

Si no quieres empezar con los modelos predeterminados y quieres eliminarlos / modificarlos, desde el principio, sin tener ninguna revisión previa, puedes eliminar los archivos de revisión (archivos `.py` de Python) bajo `./backend/app/alembic/versions/`. Y luego crear una primera migración como se describió anteriormente.

## Plantillas de Email

Las plantillas de email están en `./backend/app/email-templates/`. Aquí hay dos directorios: `build` y `src`. El directorio `src` contiene los archivos fuente que se usan para construir las plantillas de email finales. El directorio `build` contiene las plantillas de email finales que usa la aplicación.

Antes de continuar, asegúrate de tener instalada la [extensión MJML](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml) en tu VS Code.

Una vez que tengas instalada la extensión MJML, puedes crear una nueva plantilla de email en el directorio `src`. Después de crear la nueva plantilla de email y con el archivo `.mjml` abierto en tu editor, abre la paleta de comandos con `Ctrl+Shift+P` y busca `MJML: Export to HTML`. Esto convertirá el archivo `.mjml` a un archivo `.html` y ahora puedes guardarlo en el directorio build.

## Credenciales por Defecto

- **Email:** `admin@example.com`
- **Contraseña:** `changethis`

> ⚠️ **Importante:** Cambia estas credenciales antes de desplegar a producción.
