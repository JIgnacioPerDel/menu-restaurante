# 🍽 Menú Restaurante

Carta digital para restaurantes con **pedidos desde la mesa mediante código QR**.

Cada mesa tiene su propio QR. El cliente lo escanea, ve la carta en el móvil y envía el pedido directamente a cocina, sin descargar ninguna app ni registrarse. El dueño del local gestiona los pedidos en tiempo real, la carta y las mesas desde un panel privado.

![Java](https://img.shields.io/badge/Java-21-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F) ![Angular](https://img.shields.io/badge/Angular-22-DD0031) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

## Funcionalidades

**Cliente (móvil)**
- Carta por categorías con precios y los 14 alérgenos de declaración obligatoria
- Al abrir el QR la mesa queda identificada automáticamente
- Carrito con cantidades, notas por plato («sin cebolla») y nota general
- El carrito sobrevive a recargas; se pueden hacer varios pedidos por mesa
- Seguimiento del estado de sus pedidos, que se actualiza solo

**Dueño del local (panel `/admin`)**
- Tablero de pedidos en curso (*Pendiente → En preparación → Listo → Servido*) que se refresca solo y resalta los pedidos nuevos
- Historial de pedidos servidos y cancelados
- Gestión de categorías y platos; marcar un plato como agotado con un clic
- Mesas con su QR: ver, descargar, imprimir y **regenerar** (invalida el QR anterior)

## Seguridad: separación cliente / panel

El análisis completo está en [`docs/requisitos.md`](docs/requisitos.md). En resumen:

- El control de acceso se hace **en el backend** con Spring Security: `/api/admin/**` exige un **JWT** con rol `ADMIN`; el frontend solo oculta pantallas.
- El QR no contiene el número de mesa sino un **token aleatorio (UUID)**: cambiar la URL no permite pedir en nombre de otra mesa.
- El **precio lo calcula el servidor** a partir de la carta; lo que envíe el cliente se ignora.
- Un cliente solo puede consultar sus propios pedidos y solo si pertenecen a su mesa.
- Contraseñas con BCrypt; administrador y secreto JWT se configuran por variables de entorno, nunca en el código.

Todo esto está cubierto por tests de integración ([`SecurityTests`](backend/src/test/java/com/menurestaurante/SecurityTests.java), [`OrderFlowTests`](backend/src/test/java/com/menurestaurante/OrderFlowTests.java)).

## Probarlo en local

Solo necesitas Docker:

```bash
git clone https://github.com/JIgnacioPerDel/menu-restaurante.git
cd menu-restaurante
docker compose up -d --build
```

| Qué | URL |
|-----|-----|
| Pedir como cliente (Mesa 1 de demo) | http://localhost/mesa/demo |
| Carta sin mesa (solo lectura) | http://localhost/carta |
| Panel del restaurante | http://localhost/admin (usuario `admin`, contraseña `admin`) |

Arranca con una carta y 8 mesas de ejemplo. Abre la mesa en una ventana y el panel en otra para ver llegar los pedidos.

> **Desde el móvil:** crea un `.env` con `APP_PUBLIC_URL=http://<IP-de-tu-ordenador>`, reinicia con `docker compose up -d` y escanea los QR desde *Mesas y QR*.

## Arquitectura

```
┌──────────────┐     ┌──────────────────────┐     ┌─────────────────────┐     ┌────────────┐
│ Móvil / PC   │────▶│ nginx (frontend)     │────▶│ Spring Boot (API)   │────▶│ PostgreSQL │
│ Angular SPA  │     │ SPA + proxy /api     │     │ JWT · JPA · Flyway  │     │            │
└──────────────┘     └──────────────────────┘     └─────────────────────┘     └────────────┘
```

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 22 (standalone, signals, zoneless), SCSS, Vitest |
| Backend | Java 21, Spring Boot 3.5, Spring Security (JWT con Nimbus), Spring Data JPA, Bean Validation, ZXing (QR) |
| Datos | PostgreSQL 17 con migraciones Flyway (H2 en modo PostgreSQL para desarrollo y tests) |
| Infraestructura | Docker multi-stage, nginx, Docker Compose |

## Desarrollo sin Docker

```bash
# Backend (H2 en memoria, datos de demo, admin/admin)
cd backend && ./mvnw spring-boot:run

# Frontend en http://localhost:4200 (proxy de /api al backend)
cd frontend && npm install && npm start
```

Tests:

```bash
cd backend && ./mvnw test
cd frontend && npm test
```

## Configuración

Copia [`.env.example`](.env.example) a `.env`. Antes de desplegar de verdad cambia al menos `ADMIN_PASSWORD` y `JWT_SECRET` (`openssl rand -base64 48`) y pon `DEMO_DATA=false`.

## Documentación

- [Análisis de requisitos](docs/requisitos.md): actores, requisitos funcionales, reglas de negocio, seguridad y modelo de datos
- [Backend](backend/README.md): API, perfiles y migraciones
- [Frontend](frontend/README.md): estructura y rutas
