#!/bin/bash

# Script para configurar CORS en Firebase Storage
# Este script debe ejecutarse una sola vez para configurar CORS en tu bucket de Firebase Storage

echo "🔧 Configurando CORS en Firebase Storage..."
echo ""
echo "⚠️  IMPORTANTE: Necesitas tener instalado Google Cloud SDK (gcloud)"
echo ""
echo "Si no lo tienes instalado, ejecuta:"
echo "  curl https://sdk.cloud.google.com | bash"
echo "  exec -l \$SHELL"
echo "  gcloud init"
echo ""
echo "📋 Pasos para configurar CORS:"
echo ""
echo "1. Ejecuta este comando para configurar CORS:"
echo "   gsutil cors set cors.json gs://finances-92740.firebasestorage.app"
echo ""
echo "2. O usa la Firebase Console:"
echo "   - Ve a https://console.firebase.google.com/"
echo "   - Selecciona tu proyecto 'finances-92740'"
echo "   - Ve a Storage > Rules"
echo "   - Agrega las siguientes reglas:"
echo ""
cat cors.json
echo ""
echo "3. Verifica la configuración:"
echo "   gsutil cors get gs://finances-92740.firebasestorage.app"
echo ""
echo "🌐 También puedes configurar CORS en Firebase Console:"
echo "   https://console.cloud.google.com/storage/browser/finances-92740.firebasestorage.app"
echo ""

# Si gcloud está instalado, intenta configurar CORS
if command -v gsutil &> /dev/null; then
    read -p "¿Deseas configurar CORS ahora? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        gsutil cors set cors.json gs://finances-92740.firebasestorage.app
        echo "✅ CORS configurado exitosamente"
        echo ""
        echo "📝 Verifica la configuración:"
        gsutil cors get gs://finances-92740.firebasestorage.app
    fi
else
    echo "❌ gsutil no está instalado. Instala Google Cloud SDK para continuar."
fi
