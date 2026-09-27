# Proyecto Base

Plantilla full-stack para nuevos proyectos.

| Carpeta | Tecnología |
|---------|------------|
| [`backend/`](backend/README.md) | Java 21 · Spring Boot 3.5 · Maven · Flyway |
| [`frontend/`](frontend/README.md) | Angular 22 · SCSS · Vitest |

## Con Docker (recomendado)

```bash
cp .env.example .env   # opcional: ajustar puertos y credenciales
docker compose up -d --build
```

| Servicio | Contenedor | URL local |
|----------|-----------|-----------|
| `frontend` | nginx con el build de Angular | http://localhost |
| `backend` | Spring Boot (perfil `prod`) | http://localhost:8080 |
| `db` | PostgreSQL 17 (volumen `db-data`) | `localhost:5433` |

nginx sirve la SPA y reenvía `/api/**` al contenedor del backend. Flyway crea el esquema al arrancar el backend.

Comandos útiles:

```bash
docker compose logs -f backend      # ver logs
docker compose up -d --build backend  # reconstruir un servicio tras cambios
docker compose down                 # parar (conserva los datos)
docker compose down -v              # parar y borrar la base de datos
```

## Sin Docker (desarrollo con recarga en caliente)

```bash
# Terminal 1 — backend con H2 en memoria
cd backend && ./mvnw spring-boot:run

# Terminal 2 — frontend en http://localhost:4200
cd frontend && npm install && npm start
```
