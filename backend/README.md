# Backend — Spring Boot

Java 21 · Spring Boot 3.5 · Spring Security (JWT) · Spring Data JPA · Flyway · Maven

## Arrancar

```bash
./mvnw spring-boot:run
```

Perfil `dev` por defecto: H2 en memoria, datos de demostración y administrador `admin` / `admin`.

- API: http://localhost:8080/api
- Health: http://localhost:8080/actuator/health
- Consola H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:devdb`, usuario `sa`)

## API

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/public/menu` | Público | Carta (solo platos disponibles) |
| GET | `/api/public/tables/{token}` | Token de mesa | Datos de la mesa del QR |
| POST | `/api/public/tables/{token}/orders` | Token de mesa | Crear pedido |
| GET | `/api/public/tables/{token}/orders?ids=1,2` | Token de mesa | Estado de los pedidos propios |
| POST | `/api/auth/login` | Público | Devuelve un JWT |
| GET | `/api/admin/orders?scope=active\|history` | ADMIN | Pedidos en curso o historial |
| PATCH | `/api/admin/orders/{id}/status` | ADMIN | Cambiar estado |
| GET/POST/PUT/DELETE | `/api/admin/categories[/{id}]` | ADMIN | Categorías |
| GET/POST/PUT/DELETE | `/api/admin/dishes[/{id}]` | ADMIN | Platos |
| GET/POST/PUT | `/api/admin/tables[/{id}]` | ADMIN | Mesas |
| POST | `/api/admin/tables/{id}/regenerate-token` | ADMIN | Nuevo QR (invalida el anterior) |
| GET | `/api/admin/tables/{id}/qr` | ADMIN | QR de la mesa en PNG |

Los errores siguen el formato `application/problem+json` (RFC 7807).

## Configuración

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` (H2) o `prod` (PostgreSQL) |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | — | Conexión a PostgreSQL (perfil `prod`) |
| `JWT_SECRET` | solo en `dev` | Secreto HMAC de al menos 32 bytes |
| `JWT_EXPIRATION` | `12h` | Duración de la sesión del panel |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / solo en `dev` | Administrador que se crea al arrancar si no existe |
| `APP_PUBLIC_URL` | `http://localhost:4200` | URL del frontend que se codifica en los QR |
| `DEMO_DATA` | `true` en `dev` | Carga carta y mesas de ejemplo si la base de datos está vacía |
| `CORS_ALLOWED_ORIGINS` | puertos locales | Orígenes permitidos, separados por comas |

## Base de datos y migraciones

El esquema se gestiona con **Flyway** (`src/main/resources/db/migration`), también en `dev`: H2 arranca en modo PostgreSQL para que las mismas migraciones sirvan en ambos perfiles. Hibernate solo valida (`ddl-auto: validate`), así que cada cambio en una entidad necesita su migración `V<n>__descripcion.sql`.

## Estructura (`com.menurestaurante`)

```
config/      Seguridad (JWT, reglas de acceso), CORS, propiedades, datos de demo
security/    Emisión de JWT y creación del administrador inicial
controller/  PublicController, AuthController y controladores /api/admin
service/     Lógica de negocio: carta, mesas, pedidos, QR, login
repository/  Spring Data JPA
model/       Entidades y enums (OrderStatus define las transiciones permitidas)
dto/         Records de entrada/salida
mapper/      Conversión entidad <-> DTO
exception/   Excepciones y manejador global
```

## Docker

```bash
docker build -t menu-restaurante-backend .
```

Imagen multi-stage (JDK para compilar, JRE para ejecutar) con usuario sin privilegios y perfil `prod` por defecto. Para levantarlo junto a PostgreSQL y el frontend, usa el `docker-compose.yml` de la raíz.
