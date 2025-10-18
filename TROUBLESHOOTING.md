# 🔧 Guía de Diagnóstico - Flujo de Autenticación

## ✅ Mejoras Implementadas

### 1. **Firebase con API Moderna (No Deprecada)**
- ✅ `persistentLocalCache` con soporte multi-tab
- ✅ `setPersistence` con `browserLocalPersistence`
- ✅ Eliminada función deprecada `enableIndexedDbPersistence`

### 2. **AuthContext Profesional**
- ✅ Logs detallados en cada paso del flujo
- ✅ Validación de documento Firestore
- ✅ Manejo robusto de errores con mensajes en español
- ✅ Estado de error expuesto en el contexto
- ✅ Auto-logout si no existe documento en Firestore

### 3. **LoginPage Mejorado**
- ✅ Auto-redirect si ya está autenticado
- ✅ Feedback visual mejorado (íconos, estados)
- ✅ Mensajes de error claros con AlertCircle
- ✅ Botón deshabilitado durante carga
- ✅ Atributos de accesibilidad (autoComplete)

### 4. **AdminPage Profesional**
- ✅ Logs detallados en creación de usuarios
- ✅ Manejo de errores específicos
- ✅ UI mejorada con íconos y estados
- ✅ Mensajes de éxito temporales (5 segundos)
- ✅ Validación de permisos con página de error dedicada

## 🔍 Diagnóstico del Problema de Login

### **Paso 1: Verificar que el usuario existe correctamente**

#### En Firebase Console:

1. **Authentication** → **Users**
   - ✅ Verifica que el email existe
   - ✅ Copia el **UID** del usuario

2. **Firestore Database** → **users** collection
   - ✅ Debe existir un documento con el UID copiado
   - ✅ Campos requeridos:
     ```json
     {
       "id": "<UID copiado de Auth>",
       "email": "tu-email@ejemplo.com",
       "displayName": "Tu Nombre",
       "role": "admin",
       "createdAt": <timestamp>,
       "updatedAt": <timestamp>
     }
     ```

**⚠️ IMPORTANTE:** Si el usuario existe en Auth pero NO en Firestore, el login fallará.

### **Paso 2: Abrir DevTools del navegador**

1. Presiona **F12** o clic derecho → **Inspeccionar**
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. Observa los mensajes con prefijo `[Firebase]`, `[AuthContext]` y `[LoginPage]`

### **Paso 3: Interpretar los logs**

#### ✅ **Login Exitoso** (deberías ver):
```
[LoginPage] Form submitted
[LoginPage] Email: tu-email@ejemplo.com
[LoginPage] Password length: 8
[LoginPage] Calling signIn...
[AuthContext] Attempting sign in for: tu-email@ejemplo.com
[AuthContext] Sign in successful: <UID>
[AuthContext] Auth state changed: { uid: '<UID>', email: 'tu-email@ejemplo.com', ... }
[AuthContext] Fetching user document from Firestore...
[AuthContext] User document: { id: '<UID>', email: '...', role: 'admin' }
[AuthContext] ✅ User authenticated successfully: { id: '<UID>', email: '...', role: 'admin' }
[LoginPage] User already logged in, redirecting to dashboard
```

#### ❌ **Login Fallido - Usuario sin documento Firestore**:
```
[AuthContext] Auth state changed: { uid: '<UID>', ... }
[AuthContext] Fetching user document from Firestore...
[AuthContext] User document: null
[AuthContext] ❌ User document not found in Firestore
```
**Solución:** Crear documento en Firestore con el UID del usuario.

#### ❌ **Login Fallido - Credenciales incorrectas**:
```
[AuthContext] ❌ Sign in error: auth/invalid-credential
[LoginPage] ❌ Login error: Error { message: 'Email o contraseña incorrectos' }
```
**Solución:** Verificar email y contraseña.

#### ❌ **Login Fallido - Error de red**:
```
[AuthContext] ❌ Sign in error: auth/network-request-failed
```
**Solución:** Verificar conexión a internet.

## 🛠️ Soluciones Comunes

### Problema 1: Usuario existe en Auth pero no en Firestore

**Crear documento manualmente:**

1. Firebase Console → **Firestore Database**
2. Busca o crea la colección `users`
3. **Add document**
4. Document ID: `<UID del usuario en Auth>`
5. Campos:
   ```
   id: <UID>
   email: "tu-email@ejemplo.com"
   displayName: "Tu Nombre"
   role: "admin"
   createdAt: <timestamp actual>
   updatedAt: <timestamp actual>
   ```
6. **Save**

### Problema 2: El botón de login no responde

**Verificar en la consola:**
- ¿Aparece `[LoginPage] Form submitted`?
  - **SÍ:** El formulario funciona, revisa logs siguientes
  - **NO:** Problema con el evento submit (verifica que no haya errores de JavaScript)

### Problema 3: Login exitoso pero no redirige

**En la consola deberías ver:**
```
[LoginPage] User already logged in, redirecting to dashboard
```

Si no ves este mensaje:
- Verifica que `currentUser` se actualice en AuthContext
- Revisa que el `useEffect` en LoginPage se ejecute

### Problema 4: Error "auth/invalid-credential"

**Causas comunes:**
- Email incorrecto (verifica mayúsculas/minúsculas)
- Contraseña incorrecta
- Usuario no existe en Firebase Auth

**Solución:**
1. Verifica email en Firebase Console → Authentication
2. Intenta resetear la contraseña desde Firebase Console
3. O crea el usuario nuevamente

## 🎯 Crear Primer Usuario Admin (Método Correcto)

### Opción A: Firebase Console (Recomendado)

```bash
1. Firebase Console → Authentication → Add User
   Email: admin@ejemplo.com
   Password: admin123456
   [Copiar UID generado]

2. Firestore Database → users collection → Add document
   Document ID: <UID copiado>
   Campos:
     id: "<UID>"
     email: "admin@ejemplo.com"
     displayName: "Administrador"
     role: "admin"
     createdAt: <timestamp>
     updatedAt: <timestamp>

3. Probar login en la app
```

### Opción B: Usando la app (si ya tienes un admin)

```bash
1. Login como admin existente
2. Ir a /admin
3. Click en "Nuevo Usuario"
4. Completar formulario
5. Rol: Administrador
```

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El servidor dev está corriendo (`npm run dev`)
- [ ] No hay errores de compilación en la terminal
- [ ] Firebase Console está accesible
- [ ] El usuario existe en Authentication
- [ ] El usuario tiene documento en Firestore
- [ ] El UID coincide en Auth y Firestore
- [ ] El documento tiene el campo `role`
- [ ] DevTools Console está abierto
- [ ] Se ven los logs con prefijos `[Firebase]`, `[AuthContext]`, `[LoginPage]`
- [ ] No hay errores de red en la pestaña Network

## 🔐 Reglas de Seguridad

Las reglas de Firestore están configuradas para:

```javascript
// users collection
allow read: if request.auth.uid == resource.data.id || 
               request.auth.token.role == 'admin';
allow write: if request.auth.token.role == 'admin';
```

Esto significa:
- ✅ Usuarios pueden leer solo su propio documento
- ✅ Admins pueden leer todos los documentos
- ✅ Solo admins pueden crear/modificar usuarios
- ❌ Sin acceso para usuarios no autenticados

## 📞 Soporte

Si después de seguir esta guía el problema persiste:

1. **Copia todos los logs de la consola** desde que presionas "Iniciar Sesión"
2. **Captura de pantalla** de:
   - Firebase Auth (lista de usuarios)
   - Firestore users collection
   - Consola del navegador con errores
3. **Describe exactamente qué sucede:**
   - ¿El botón responde?
   - ¿Aparece algún mensaje de error?
   - ¿Qué logs ves en la consola?

---

**Última actualización:** Octubre 2025  
**Versión:** 2.0 - Flujo profesional con logging detallado
