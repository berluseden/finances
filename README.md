# Finanzas PWA - Personal Finance Manager

Una aplicación web progresiva (PWA) moderna e instalable para gestionar finanzas personales con soporte multimoneda (DOP/USD), diseñada para funcionar completamente offline.

## 🚀 Características

- **PWA Completa**: Instalable, funciona offline, sincronización automática
- **Autenticación**: Firebase Auth con roles (admin/user)
- **Multimoneda**: Soporte completo para DOP y USD con tasas de cambio manuales
- **Gestión de Cuentas**: Tarjetas de crédito, préstamos, servicios, alquileres
- **Calendario Financiero**: Visualización mensual de cortes y vencimientos
- **Transacciones**: CRUD completo + importación CSV + adjuntos
- **Presupuestos**: Planificación mensual por categoría
- **Pagos Recurrentes**: Automatización de pagos mensuales fijos
- **Dark Mode**: Tema oscuro opcional
- **Exportación**: CSV y JSON backup completo

## 🏗️ Stack Tecnológico

- **React 19** + TypeScript 5
- **Vite 7** - Build tool
- **Firebase 12** - Backend (Auth, Firestore, Storage, Hosting)
- **Tailwind CSS 4** - Styling
- **React Router 7** - Routing
- **TanStack Query 5** - State management
- **React Big Calendar 1.19** - Calendar UI
- **Recharts 3.3** - Data visualization
- **Zod 4** - Schema validation
- **vite-plugin-pwa 1.1** + **Workbox 7** - PWA capabilities

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ y npm
- Firebase CLI: `npm install -g firebase-tools`

### Pasos de instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar Firebase**
   
   Ya está configurado con el proyecto `finances-92740`

3. **Crear primer usuario admin**
   
   ⚠️ **IMPORTANTE**: Esta app NO tiene registro público. Solo admins crean usuarios.
   
   Sigue la guía detallada en [`SETUP_USERS.md`](./SETUP_USERS.md) o usa el helper:
   
   ```bash
   node scripts/create-admin.js
   ```
   
   El script te guiará paso a paso para crear el usuario en Firebase Console.
   ```
   users/{uid} → role: "admin"
   ```

4. **Generar iconos PWA**
   
   Coloca tus iconos en `/public/icons/`:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

## 🛠️ Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Verificación de tipos
npm run typecheck

# Linting
npm run lint
```

## 🔥 Deploy a Firebase

```bash
npm run build
firebase deploy
```

## 📱 Instalación de PWA

La app se puede instalar desde el navegador (Chrome/Edge/Safari) con el botón de instalación.

## 🗄️ Estructura de Firestore

```
users/{uid} → perfil, rol
accounts/{id} → cuentas multimoneda
transactions/{id} → transacciones con adjuntos
recurringPayments/{id} → pagos fijos mensuales
budgets/{id} → presupuestos por categoría
calendarEvents/{id} → eventos de calendario
```

## 🔒 Seguridad

- **Firestore Rules**: Solo el propietario puede leer/escribir sus datos; admin ve todo
- **Storage Rules**: Solo el usuario puede acceder a sus recibos
- **Offline Persistence**: IndexedDB habilitado para caché local seguro

## 🌐 Offline-First

La app funciona completamente offline con sincronización automática al reconectar.

---

**Desarrollado con ❤️ para gestionar finanzas personales de manera simple y eficiente**