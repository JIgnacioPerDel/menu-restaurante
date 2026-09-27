# Análisis de requisitos — Menú Restaurante

## 1. Contexto y objetivo

Un restaurante quiere sustituir la carta en papel por una carta web. Cada mesa tiene un **código QR** propio: al escanearlo, el cliente ve la carta y puede **hacer el pedido desde el móvil** sin esperar al camarero. El pedido queda asociado automáticamente a la mesa.

El **dueño del local** (y su personal) necesita una vista privada donde recibir los pedidos, seguir su estado y mantener la carta y las mesas. Los clientes no deben poder acceder a esa vista.

## 2. Actores

| Actor | Cómo accede | Qué puede hacer |
|-------|-------------|-----------------|
| **Visitante** | URL pública `/carta` | Consultar la carta (solo lectura) |
| **Cliente en mesa** | Escaneando el QR → `/mesa/{token}` | Consultar la carta, montar un pedido, enviarlo y ver su estado |
| **Administrador** (dueño/personal) | `/admin`, con usuario y contraseña | Ver y gestionar pedidos, carta y mesas |

## 3. Requisitos funcionales

### Carta (pública)

- **RF-01** Mostrar la carta agrupada por categorías, en el orden que defina el administrador.
- **RF-02** Cada plato muestra nombre, descripción, precio y alérgenos (los 14 de declaración obligatoria en la UE).
- **RF-03** Los platos marcados como *no disponibles* no se muestran a los clientes.
- **RF-04** La carta se puede consultar sin QR (`/carta`), pero en ese modo no se puede pedir.

### Pedido desde la mesa

- **RF-05** Al abrir el QR, la aplicación identifica la mesa y la muestra en pantalla («Mesa 4»).
- **RF-06** El cliente añade platos a un carrito, ajusta cantidades y puede escribir una nota por plato («sin cebolla») y una nota general.
- **RF-07** El carrito se conserva si el cliente recarga la página o cierra el navegador sin enviar el pedido.
- **RF-08** Al enviar, el cliente recibe confirmación con el número de pedido y el total.
- **RF-09** El cliente puede ver el estado de los pedidos que ha hecho desde su dispositivo, y se actualiza solo.
- **RF-10** Una mesa puede hacer varios pedidos (primero bebidas, luego postres…).
- **RF-11** Si el QR corresponde a una mesa desactivada o regenerada, se informa al cliente de que no puede pedir y se le remite al personal.

### Panel de administración

- **RF-12** Acceso con usuario y contraseña.
- **RF-13** Vista de pedidos activos, ordenados por antigüedad, con mesa, líneas, notas, total y hora. Se actualiza automáticamente y avisa de los pedidos nuevos.
- **RF-14** Cambiar el estado de un pedido: `Pendiente → En preparación → Listo → Servido`, o `Cancelado` mientras no esté servido.
- **RF-15** Consultar el histórico de pedidos (servidos y cancelados).
- **RF-16** Gestionar categorías: crear, renombrar, ordenar y eliminar (solo si no tienen platos).
- **RF-17** Gestionar platos: crear, editar, marcar como disponible o no disponible y eliminar.
- **RF-18** Gestionar mesas: crear, renombrar, activar o desactivar.
- **RF-19** Ver, descargar e imprimir el QR de cada mesa.
- **RF-20** Regenerar el QR de una mesa, lo que invalida el anterior (por ejemplo, si alguien se lo ha llevado en una foto).

## 4. Reglas de negocio

- **RN-01** El precio de cada línea lo calcula **el servidor** a partir de la carta; el cliente solo envía el plato y la cantidad. Cualquier precio que venga del cliente se ignora.
- **RN-02** Cada línea guarda una copia del nombre y el precio del plato en el momento del pedido, para que el histórico no cambie si después se modifica la carta.
- **RN-03** No se puede pedir un plato no disponible ni una cantidad fuera del rango 1–50.
- **RN-04** Un pedido necesita al menos una línea.
- **RN-05** Las transiciones de estado solo pueden ir hacia delante; un pedido servido o cancelado ya no cambia.

## 5. Seguridad y control de acceso

Es el requisito principal que separa las dos vistas. Se aplica **en el backend**: el frontend solo oculta pantallas, pero no es una barrera de seguridad.

| Recurso | Acceso |
|---------|--------|
| `GET /api/public/menu` | Cualquiera |
| `GET /api/public/tables/{token}` | Quien tenga el token de la mesa |
| `POST /api/public/tables/{token}/orders` | Quien tenga el token de la mesa |
| `GET /api/public/tables/{token}/orders/{id}` | Quien tenga el token **y** el pedido sea de esa mesa |
| `POST /api/auth/login` | Cualquiera (devuelve un token si las credenciales son correctas) |
| `/api/admin/**` | Solo usuarios autenticados con rol `ADMIN` |

- **RS-01** Las mesas se identifican en el QR con un **token aleatorio (UUID)**, no con su número. Así un cliente no puede cambiar la URL de `/mesa/4` a `/mesa/5` y pedir para otra mesa.
- **RS-02** El panel se protege con autenticación **JWT** (sin estado), con caducidad configurable.
- **RS-03** Las contraseñas se guardan con **BCrypt**. El usuario administrador inicial se crea al arrancar a partir de variables de entorno; no hay credenciales reales en el código.
- **RS-04** El secreto de firma de los JWT se configura por variable de entorno en producción.
- **RS-05** Un cliente no puede listar los pedidos de la mesa: solo consulta los que ha hecho él (su dispositivo guarda los identificadores).
- **RS-06** Toda entrada se valida en el servidor (longitudes, rangos, campos obligatorios).

## 6. Requisitos no funcionales

- **RNF-01** Vista del cliente pensada para **móvil** primero.
- **RNF-02** Despliegue reproducible con **Docker Compose** (PostgreSQL + backend + frontend).
- **RNF-03** El esquema de base de datos se versiona con **Flyway**.
- **RNF-04** Tests automáticos en backend (incluidos los de seguridad) y frontend.
- **RNF-05** Datos de demostración opcionales para enseñar la aplicación sin cargar nada a mano.
- **RNF-06** La vista de pedidos se refresca en pocos segundos (sondeo periódico).

## 7. Modelo de datos

```
categories        (id, name, position)
dishes            (id, category_id → categories, name, description, price, available)
dish_allergens    (dish_id → dishes, allergen)
restaurant_tables (id, name, token UNIQUE, active)
orders            (id, table_id → restaurant_tables, status, notes, total, created_at, updated_at)
order_lines       (id, order_id → orders, dish_id → dishes, dish_name, unit_price, quantity, notes)
app_users         (id, username UNIQUE, password_hash, role)
```

## 8. Flujos principales

**Cliente**
1. Escanea el QR → `/mesa/{token}`.
2. El frontend valida el token con `GET /api/public/tables/{token}` y muestra la mesa.
3. Añade platos al carrito (guardado en el dispositivo) y envía el pedido.
4. El servidor valida los platos, calcula el total y crea el pedido `PENDIENTE`.
5. El cliente ve el pedido en «Mis pedidos», con su estado actualizándose solo.

**Administrador**
1. Inicia sesión en `/admin/login` → recibe un JWT.
2. El panel de pedidos consulta los pedidos activos cada pocos segundos y resalta los nuevos.
3. Avanza cada pedido por los estados hasta *Servido*.

## 9. Fuera de alcance (posibles mejoras)

- Pago online y división de la cuenta.
- Varios roles de personal (cocina, sala) y varios restaurantes.
- Notificaciones en tiempo real con WebSocket/SSE en lugar de sondeo.
- Imágenes de los platos.
- Carta en varios idiomas.
- Límite de peticiones (*rate limiting*) para evitar abusos en el envío de pedidos.

## 10. Supuestos

- Un único restaurante y un único perfil de administrador (el dueño y su personal comparten el rol).
- El pago se hace en el local, como hasta ahora.
- Los clientes no se registran: la mesa es su identificador.
