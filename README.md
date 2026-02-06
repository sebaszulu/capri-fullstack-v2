# Hotel Capri Doradal - Sistema de Gestión Hotelera

<a href="https://github.com/fastapi/full-stack-fastapi-template/actions?query=workflow%3ATest" target="_blank"><img src="https://github.com/fastapi/full-stack-fastapi-template/workflows/Test/badge.svg" alt="Test"></a>
<a href="https://coverage-badge.samuelcolvin.workers.dev/redirect/fastapi/full-stack-fastapi-template" target="_blank"><img src="https://coverage-badge.samuelcolvin.workers.dev/fastapi/full-stack-fastapi-template.svg" alt="Coverage"></a>

Sistema completo de gestión hotelera para Hotel Capri Doradal, desarrollado con tecnologías modernas para administrar habitaciones, reservas y huéspedes.

## Stack Tecnológico y Características

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) para la API backend en Python.
    - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) para interacciones con base de datos SQL en Python (ORM).
    - 🔍 [Pydantic](https://docs.pydantic.dev), usado por FastAPI, para validación de datos y gestión de configuraciones.
    - 💾 [PostgreSQL](https://www.postgresql.org) como base de datos SQL.
- 🚀 [React](https://react.dev) para el frontend.
    - 💃 Usando TypeScript, hooks, Vite y otras partes de un stack frontend moderno.
    - 🎨 [Chakra UI](https://chakra-ui.com) para los componentes del frontend.
    - 🤖 Cliente frontend generado automáticamente.
    - 🧪 [Playwright](https://playwright.dev) para tests End-to-End.
    - 🦇 Soporte para modo oscuro.
- 🐋 [Docker Compose](https://www.docker.com) para desarrollo y producción.
- 🔒 Hash seguro de contraseñas por defecto.
- 🔑 Autenticación JWT (JSON Web Token).
- 📫 Recuperación de contraseña basada en email.
- ✅ Tests con [Pytest](https://pytest.org).
- 📞 [Traefik](https://traefik.io) como proxy inverso / balanceador de carga.
- 🚢 Instrucciones de despliegue usando Docker Compose, incluyendo cómo configurar un proxy Traefik para manejar certificados HTTPS automáticos.
- 🏭 CI (integración continua) y CD (despliegue continuo) basado en GitHub Actions.

### Funcionalidades del Hotel

- 🏨 **Gestión de Tipos de Habitación** - Crear y administrar categorías de habitaciones con precios y amenidades.
- 🛏️ **Gestión de Habitaciones** - Control de inventario de habitaciones y disponibilidad.
- 📅 **Sistema de Reservas** - Reservas con verificación de disponibilidad en tiempo real.
- 👥 **Gestión de Usuarios** - Administración de huéspedes y personal del hotel.
- 📊 **Dashboard Administrativo** - Panel de control con estadísticas de ocupación.

## Inicio Rápido

### Requisitos Previos

- [Docker](https://www.docker.com/) instalado
- [Git](https://git-scm.com/) instalado

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/capri-fullstack.git
cd capri-fullstack
```

2. Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Inicia los servicios con Docker Compose:

```bash
docker compose up -d
```

4. Crea los datos iniciales (usuario administrador):

```bash
docker compose exec backend python -m app.initial_data
```

5. Abre tu navegador en:
   - **Frontend:** http://localhost:5173
   - **API Docs:** http://localhost:8000/docs
   - **Adminer (DB):** http://localhost:8080

### Credenciales por Defecto

- **Email:** `admin@example.com`
- **Contraseña:** `changethis`

> ⚠️ **Importante:** Cambia estas credenciales antes de desplegar a producción.

## Configuración

Puedes actualizar las configuraciones en los archivos `.env` para personalizar tus configuraciones.

Antes de desplegar, asegúrate de cambiar al menos los valores de:

- `SECRET_KEY`
- `FIRST_SUPERUSER_PASSWORD`
- `POSTGRES_PASSWORD`

Puedes (y debes) pasar estos como variables de entorno desde secretos.

Lee los docs de [deployment.md](./deployment.md) para más detalles.

### Generar Claves Secretas

Algunas variables de entorno en el archivo `.env` tienen un valor por defecto de `changethis`.

Tienes que cambiarlas por una clave secreta, para generar claves secretas puedes ejecutar el siguiente comando:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copia el contenido y úsalo como contraseña / clave secreta. Y ejecútalo de nuevo para generar otra clave segura.

## Desarrollo del Backend

Documentación del backend: [backend/README.md](./backend/README.md).

## Desarrollo del Frontend

Documentación del frontend: [frontend/README.md](./frontend/README.md).

## Despliegue

Documentación de despliegue: [deployment.md](./deployment.md).

## Desarrollo

Documentación general de desarrollo: [development.md](./development.md).

Esto incluye usar Docker Compose, dominios locales personalizados, configuraciones `.env`, etc.

## Notas de Versión

Revisa el archivo [release-notes.md](./release-notes.md).

## Estructura del Proyecto

```
capri-fullstack/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints de la API
│   │   ├── core/           # Configuración y seguridad
│   │   ├── crud/           # Operaciones de base de datos
│   │   ├── models/         # Modelos SQLModel
│   │   └── email-templates/ # Plantillas de email
│   └── tests/              # Tests del backend
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── routes/         # Páginas y rutas
│   │   ├── hooks/          # Custom hooks
│   │   └── client/         # Cliente API generado
│   └── tests/              # Tests E2E con Playwright
├── docker-compose.yml      # Configuración de servicios
└── .env                    # Variables de entorno
```

## Licencia

Este proyecto está basado en el Full Stack FastAPI Template, licenciado bajo los términos de la licencia MIT.

---

Desarrollado con ❤️ para **Hotel Capri Doradal** - Tu refugio en el corazón del Magdalena Medio.
