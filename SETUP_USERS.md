# 👤 Configuración de Usuarios

Esta aplicación es **privada** y solo los administradores pueden crear usuarios.

## 🔐 Crear el Primer Usuario Admin

Como la aplicación no tiene registro público, debes crear el primer usuario manualmente:

### Firebase Console (Método Recomendado)

1. **Abre Firebase Console**
   - Ve a: https://console.firebase.google.com/project/finances-92740

2. **Crea el usuario en Authentication**
   - Ve a **Authentication** → **Users** → **Add User**
   - Email: tu-email@ejemplo.com
   - Contraseña: (mínimo 6 caracteres)
   - Haz clic en **Add User**
   - **Copia el UID** del usuario creado

3. **Crea el documento en Firestore**
   - Ve a **Firestore Database**
   - Haz clic en **Start collection**
   - Collection ID: `users`
   - Document ID: (pega el UID copiado)
   - Campos:
     ```
     email: "tu-email@ejemplo.com"
     displayName: "Tu Nombre"
     role: "admin"
     createdAt: (timestamp actual)
     updatedAt: (timestamp actual)
     ```
   - Haz clic en **Save**

4. **Inicia sesión**
   - Ve a la aplicación
   - Usa el email y contraseña que creaste
   - Ahora eres admin ✅

## 👥 Crear Usuarios Adicionales

Una vez que tengas acceso como admin:

1. Inicia sesión en la aplicación
2. Ve a **Administración** en el menú lateral (ícono de escudo 🛡️)
3. Haz clic en **Nuevo Usuario**
4. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Rol (Usuario o Administrador)
5. Haz clic en **Crear Usuario**

El usuario se creará automáticamente en Firebase Auth y Firestore.

## 🔑 Roles

- **admin**: Acceso completo + puede crear otros usuarios
- **user**: Acceso normal (solo sus propios datos)

## 🚨 Importante

- **NO HAY REGISTRO PÚBLICO**: Los usuarios solo pueden ser creados por administradores
- Cada usuario solo ve sus propios datos financieros
- Los administradores pueden crear usuarios desde el módulo de administración
- Las reglas de Firestore garantizan que cada usuario solo pueda acceder a sus documentos

## 🔐 Seguridad

Las reglas de Firestore están configuradas para:
- ✅ Usuarios solo leen/escriben sus propios datos
- ✅ Admins tienen acceso completo
- ✅ Sin acceso para usuarios no autenticados
- ✅ Sin registro público

## ❓ Problemas Comunes

### "No tienes permisos para acceder a esta página"
- Tu usuario no tiene rol `admin`
- Verifica en Firestore que el campo `role` sea `"admin"`

### "Error al crear usuario"
- Verifica tu conexión a internet
- Asegúrate de que el email no esté ya registrado
- La contraseña debe tener mínimo 6 caracteres

### "Usuario creado pero no puede iniciar sesión"
- Verifica que el usuario se creó tanto en Auth como en Firestore
- El UID debe coincidir en ambos lugares
