# 🔧 SOLUCIÓN RÁPIDA - Error de CORS

## ❌ El Problema
Al intentar subir PDFs a Firebase Storage, aparece este error:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

## ✅ SOLUCIONADO - Código Actualizado

### 🎯 Lo que se arregló:

1. **Ruta de almacenamiento correcta:**
   - ✅ Ahora usa `firebaseUser.uid` en lugar de `currentUser.id`
   - ✅ Coincide perfectamente con las reglas de Storage
   - ✅ Ruta: `statements/{firebaseUser.uid}/{accountId}/{timestamp_filename.pdf}`

2. **Storage Rules ya están configuradas:**
   ```
   match /statements/{userId}/{accountId}/{allPaths=**} {
     allow read: if isAuthenticated() && request.auth.uid == userId;
     allow write: if isAuthenticated() && request.auth.uid == userId;
   }
   ```

3. **El PDF se sube correctamente a:**
   ```
   gs://finances-92740.firebasestorage.app/statements/{tu-uid}/{account-id}/{archivo.pdf}
   ```

---

## � Si TODAVÍA tienes error de CORS

El problema puede ser que Firebase Storage necesita configuración CORS adicional para GitHub Codespaces.

### SOLUCIÓN EN 1 COMANDO:

Ejecuta esto en la terminal de Firebase Console (Cloud Shell):

```bash
echo '[{"origin":["*"],"method":["GET","HEAD","PUT","POST","DELETE"],"maxAgeSeconds":3600,"responseHeader":["Content-Type","Authorization","Content-Length","User-Agent","X-Requested-With"]}]' | gsutil cors set /dev/stdin gs://finances-92740.firebasestorage.app
```

O sigue las instrucciones detalladas en **[CORS_SETUP.md](./CORS_SETUP.md)**

---

## 🧪 Verificar que funciona

1. Recarga la página (Ctrl+Shift+R)
2. Ve a una cuenta
3. Haz clic en "Subir Estado de Cuenta"
4. Selecciona un PDF
5. ¡Debería subirse sin errores! ✅

---

## � Estructura de Archivos

```
gs://finances-92740.firebasestorage.app/
└── statements/
    └── {tu-usuario-id}/
        └── {cuenta-id}/
            ├── 1729123456789_estado-octubre.pdf
            ├── 1729234567890_estado-noviembre.pdf
            └── ...
```

---

**Última actualización:** Octubre 2025  
**Estado:** ✅ Código corregido - Usa UID correcto de Firebase
