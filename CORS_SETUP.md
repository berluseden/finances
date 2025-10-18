# Configurar CORS en Firebase Storage

## 🔴 Error Actual
```
Access to XMLHttpRequest has been blocked by CORS policy
```

Este error ocurre porque Firebase Storage no tiene configurado CORS para permitir peticiones desde GitHub Codespaces.

## ✅ Solución

### Opción 1: Usar Firebase Console (Más Fácil)

1. **Ve a Firebase Console:**
   - https://console.firebase.google.com/
   - Selecciona tu proyecto: `finances-92740`

2. **Ve a Storage:**
   - En el menú lateral, haz clic en "Storage"
   - Haz clic en "Rules"

3. **Actualiza las reglas de Storage:**
   Reemplaza el contenido con:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Opción 2: Usar Google Cloud Console (Configuración CORS completa)

1. **Instala Google Cloud SDK** (si no lo tienes):
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Autentica con tu cuenta de Google:**
   ```bash
   gcloud auth login
   ```

3. **Configura el proyecto:**
   ```bash
   gcloud config set project finances-92740
   ```

4. **Aplica la configuración CORS:**
   ```bash
   gsutil cors set cors.json gs://finances-92740.firebasestorage.app
   ```

5. **Verifica la configuración:**
   ```bash
   gsutil cors get gs://finances-92740.firebasestorage.app
   ```

### Opción 3: Usar la consola web de Google Cloud

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/storage/browser/finances-92740.firebasestorage.app

2. **Configura CORS:**
   - Haz clic en los tres puntos (⋮) del bucket
   - Selecciona "Edit CORS configuration"
   - Pega la configuración del archivo `cors.json`
   - Guarda los cambios

## 📝 Archivo de Configuración CORS

El archivo `cors.json` ya está creado en la raíz del proyecto con esta configuración:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Authorization", 
      "Content-Length",
      "User-Agent",
      "X-Requested-With"
    ]
  }
]
```

## 🔒 Configuración de Producción (Recomendada)

Para producción, **NO uses `"origin": ["*"]`**. En su lugar, especifica tus dominios:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "https://tu-dominio.com",
      "https://urban-doodle-56vwv4jg57f45x6-5174.app.github.dev"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "User-Agent", 
      "X-Requested-With"
    ]
  }
]
```

## 🧪 Verificar que funciona

Después de configurar CORS:

1. **Recarga la aplicación** (Ctrl+Shift+R o Cmd+Shift+R)
2. **Intenta subir un PDF** nuevamente
3. **Revisa la consola** - no deberían aparecer errores de CORS

## ⚠️ Notas Importantes

- **CORS se configura a nivel de bucket**, no a nivel de archivo
- **Los cambios pueden tardar unos minutos** en propagarse
- **Si sigues teniendo problemas**, verifica que las reglas de Storage permitan lectura/escritura para usuarios autenticados
- **GitHub Codespaces usa URLs dinámicas**, por eso es mejor usar `"*"` en desarrollo o agregar el patrón completo

## 🔐 Reglas de Storage Actuales

Asegúrate de que tus reglas en `storage.rules` sean:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /statements/{userId}/{accountId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📞 Si nada funciona

Si después de configurar CORS sigues teniendo problemas:

1. Verifica que estás autenticado en Firebase
2. Revisa las reglas de Storage en Firebase Console
3. Asegúrate de que tu usuario tiene permisos en el proyecto
4. Intenta desde un navegador diferente o en incógnito
5. Revisa los logs de Firebase Console > Storage > Usage

---

**Última actualización:** Octubre 2025
