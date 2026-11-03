# 🍧 FROST GLACIAL — Granizados Artesanales con y sin Alcohol a Domicilio

Proyecto completo e independiente desarrollado en **Spring Boot 3.2.5 (Java 17)** con persistencia en **MongoDB Atlas**, seguridad **Spring Security + JWT (JJWT 0.12.5)**, frontend inmersivo **Sub-Cero 360°** con texturas de hielo triturado, niebla criogénica ambiental, estela interactiva del cursor y un **Panel Administrativo completo estilo ISIVI**.

---

## 🚀 Inicio Rápido

1. Abre la carpeta en tu terminal o haz doble clic en `iniciar.bat`:
   ```bash
   mvn spring-boot:run
   ```
2. Abre tu navegador en:
   ```
   http://localhost:8080
   ```

---

## 🔐 Credenciales del Panel Administrativo

- **URL de acceso**: Haz clic en el botón **`🔒 Admin`** en la barra superior o ve a la app.
- **Usuario**: `admin`
- **Contraseña inicial**: `admin123`

---

## ❄️ Experiencia Visual Inmersiva "Sub-Cero 360°"

### 🍹 1. Experiencia del Cliente (Tienda Glacial)
- **Marco Perimetral "Pantalla como Vaso Congelado"**: Texturas translúcidas de escarcha cristalina y gotas de rocío frío en los bordes y esquinas de la pantalla.
- **Atmósfera Criogénica de Fondo**: Capas de niebla helada flotando suavemente en el fondo con micro-burbujas y partículas de hielo triturado que brillan con la luz.
- **Estela Glacial Interactiva**: Al mover el cursor del mouse, se desprenden micro-cristales de hielo en tonos cian y magenta neón.
- **Tarjetas "Bloques de Hielo Neón Esculpidos"**:
  - Borde superior escarchado con relieve de cristales de hielo/azúcar.
  - Resplandores interiores vivos según el sabor (Verde menta y cian para cócteles, rojo rubí para frutos rojos, naranja y amarillo solar para mango y maracuyá).
  - Selector de tamaño interactivo (12 oz, 16 oz, 24 oz) con cálculo de precio instantáneo.
- **Efecto Splash al Carrito**: Al hacer clic en "+ Añadir", una salpicadura helada viaja hacia el carrito en la barra superior.
- **Rastreo de Pedidos en Vivo**: Seguimiento de 4 etapas (`Recibido` ➔ `En Batido` ➔ `En Camino` ➔ `Entregado`) con el código único (`GRZ-XXXXX`).
- **Checkout a Domicilio**: Registro de dirección, barrio, indicaciones de entrega y método de pago (Efectivo contra entrega, Nequi, Daviplata, Bancolombia).
- **Ticket Digital & Confirmación Directa a WhatsApp**: Genera automáticamente el mensaje estructurado para confirmar el pedido con la tienda.

---

### 🛡️ 2. Panel Administrativo Interactivo (Estilo ISIVI)
- **Dashboard & KPIs**:
  - Ventas de Hoy y Ventas Totales acumuladas.
  - Pedidos por preparar y en ruta en tiempo real.
  - Gráfico interactivo circular (Chart.js) comparando ventas **Con Alcohol vs Sin Alcohol**.
- **Gestión de Pedidos a Domicilio**:
  - Lista completa de pedidos con filtros por estado.
  - Selector de cambio de estado de 1 clic (`RECIBIDO`, `EN_PREPARACION`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`).
  - Botón directo de WhatsApp para enviar actualizaciones automáticas de estado al teléfono del cliente.
- **Gestión de Catálogo (CRUD Completo)**:
  - Crear, editar y eliminar granizados.
  - Configurar precios por tamaño, licor base, graduación alcohólica, stock, insignia y fotos.
  - Switch rápido para pausar o activar disponibilidad.
- **Ajustes del Negocio**:
  - Configuración de horarios de atención, costo base de envío, pedido mínimo, WhatsApp de pedidos y cuentas de pago.
