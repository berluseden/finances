#!/usr/bin/env node

/**
 * Script para crear documento de usuario en Firestore
 * Soluciona el problema cuando el usuario existe en Auth pero no en Firestore
 * 
 * Uso:
 *   node scripts/fix-user.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAyAQdnZqzc8ovY3EsbGT8h2jLASE0M-Zw',
  authDomain: 'finances-92740.firebaseapp.com',
  projectId: 'finances-92740',
  storageBucket: 'finances-92740.firebasestorage.app',
  messagingSenderId: '296712058165',
  appId: '1:296712058165:web:e9a2f0940d22a54326087c',
  measurementId: 'G-Z41YXX99VZ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createUserDocument() {
  const userId = 'Pc7WKhZyO8WRxEIaQqLZsDGXhFE3';
  const email = 'berluseden@gmail.com';
  const displayName = 'Berluse Den';
  const role = 'admin';

  console.log('\n🔧 Creando documento de usuario en Firestore...\n');
  console.log('📋 Datos:');
  console.log(`   UID: ${userId}`);
  console.log(`   Email: ${email}`);
  console.log(`   Nombre: ${displayName}`);
  console.log(`   Rol: ${role}\n`);

  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      id: userId,
      email: email,
      displayName: displayName,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ ¡Documento creado exitosamente!\n');
    console.log('🎉 Ahora puedes:');
    console.log('   1. Refrescar la página de login');
    console.log('   2. Iniciar sesión con:');
    console.log(`      Email: ${email}`);
    console.log('      Password: (tu contraseña)');
    console.log('\n   El login debería funcionar ahora.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear documento:', error);
    console.error('\nDetalles:', error.message);
    process.exit(1);
  }
}

createUserDocument();
