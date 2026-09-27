# Frontend — Angular

Angular 22 (standalone, zoneless, signals) · SCSS · Vitest

## Arrancar

```bash
npm install
npm start
```

App en http://localhost:4200. Las peticiones a `/api` se redirigen al backend (`http://localhost:8080`) mediante `proxy.conf.json`.

## Rutas

| Ruta | Quién | Descripción |
|------|-------|-------------|
| `/carta` | Cualquiera | Carta de solo lectura |
| `/mesa/:token` | Cliente (QR) | Carta + carrito + seguimiento de pedidos |
| `/admin/login` | Personal | Inicio de sesión |
| `/admin/pedidos` | Personal | Tablero de pedidos en tiempo real |
| `/admin/carta` | Personal | Categorías y platos |
| `/admin/mesas` | Personal | Mesas y códigos QR |

Las rutas `/admin/**` están protegidas por `authGuard`, pero la seguridad real está en el backend: el guard es solo para la experiencia de usuario.

## Estructura (`src/app`)

```
core/
  auth/          AuthService (sesión JWT) y authGuard
  interceptors/  authInterceptor (añade el JWT solo a /api/admin) y errorInterceptor
  models/        Tipos compartidos: carta, pedidos, mesas
shared/          Componentes reutilizables
layout/          PublicLayout y AdminLayout
features/
  menu/          Parte pública: carta, página de mesa, carrito (CartStore)
  admin/         Panel: login, pedidos, carta, mesas
```

## Docker

Imagen multi-stage: Node compila la app y **nginx** sirve `dist/frontend/browser`. `nginx.conf` redirige `/api/` al servicio `backend` de docker-compose y devuelve `index.html` en cualquier otra ruta.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo con proxy |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Tests unitarios (Vitest) |
