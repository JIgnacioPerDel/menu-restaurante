# Backend — Spring Boot

Java 21 · Spring Boot 3.5 · Maven · Flyway

## Arrancar

```bash
./mvnw spring-boot:run
```

- API: http://localhost:8080/api/items
- Health: http://localhost:8080/actuator/health
- Consola H2 (perfil dev): http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:devdb`, usuario `sa`)

## Perfiles

| Perfil | Base de datos | Activación |
|--------|---------------|------------|
| `dev` (por defecto) | H2 en memoria | — |
| `prod` | PostgreSQL | `SPRING_PROFILES_ACTIVE=prod` + `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |

Otras variables: `SERVER_PORT`, `CORS_ALLOWED_ORIGINS` (separadas por comas).

## Base de datos y migraciones

El esquema se gestiona con **Flyway** (`src/main/resources/db/migration`), también en `dev`: H2 arranca en modo PostgreSQL para que las mismas migraciones sirvan en ambos perfiles. Hibernate solo valida (`ddl-auto: validate`), así que cada cambio en una entidad necesita su migración `V<n>__descripcion.sql`.

## Docker

```bash
docker build -t proyecto-base-backend .
```

Imagen multi-stage (JDK para compilar, JRE para ejecutar) con usuario sin privilegios y perfil `prod` por defecto. Para levantarlo junto a PostgreSQL y el frontend, usa el `docker-compose.yml` de la raíz.

## Estructura (`com.proyectobase`)

```
config/      Configuración (CORS, beans...)
controller/  Endpoints REST
service/     Lógica de negocio
repository/  Acceso a datos (Spring Data JPA)
model/       Entidades JPA (extienden BaseEntity: id + auditoría)
dto/         Objetos de entrada/salida (records)
mapper/      Conversión entidad <-> DTO
exception/   Excepciones y manejador global (ProblemDetail RFC 7807)
```

`Item` es un CRUD de ejemplo que recorre todas las capas; úsalo como plantilla y renómbralo o elimínalo.

## Tests

```bash
./mvnw test
```
