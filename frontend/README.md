# Frontend — Angular

Angular 22 (standalone, zoneless, signals) · SCSS · Vitest

## Arrancar

```bash
npm install
npm start
```

App en http://localhost:4200. Las peticiones a `/api` se redirigen al backend (`http://localhost:8080`) mediante `proxy.conf.json`, así que en desarrollo no hay problemas de CORS.

## Estructura (`src/app`)

```
core/          Piezas globales: interceptores HTTP, modelos comunes
shared/        Componentes reutilizables (p. ej. ErrorMessage)
layout/        Estructura visual (Header)
features/      Una carpeta por funcionalidad, con carga diferida
  items/       Ejemplo CRUD contra /api/items
    models/    Interfaces TypeScript
    services/  Acceso a la API
    pages/     Componentes enrutados
```

`src/environments/` contiene la URL de la API (`environment.development.ts` en `ng serve`, `environment.ts` en producción).

## Docker

Imagen multi-stage: Node compila la app y **nginx** sirve `dist/frontend/browser`. `nginx.conf` redirige `/api/` al servicio `backend` de docker-compose y devuelve `index.html` en cualquier otra ruta (necesario para el router de Angular).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo con proxy |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Tests unitarios (Vitest) |
