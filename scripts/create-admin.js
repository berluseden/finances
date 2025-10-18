#!/usr/bin/env node

/**
 * Script para crear el primer usuario administrador
 * 
 * Uso:
 *   node scripts/create-admin.js
 * 
 * Este script te guiará para crear el primer usuario admin en Firebase
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('\n🔐 Creador de Usuario Administrador\n');
console.log('Este script te ayudará a crear el primer usuario admin en Firebase.\n');

async function main() {
  console.log('📋 Instrucciones:\n');
  console.log('1. Abre Firebase Console: https://console.firebase.google.com/project/finances-92740');
  console.log('2. Ve a Authentication → Users');
  console.log('3. Click en "Add user"\n');

  await question('Presiona Enter cuando estés listo para continuar...');

  console.log('\n✍️  Crea el usuario con estos datos:\n');
  
  const email = await question('Email del admin: ');
  const password = await question('Contraseña (mínimo 6 caracteres): ');
  const displayName = await question('Nombre completo: ');

  console.log('\n📝 Resumen:\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${'*'.repeat(password.length)}`);
  console.log(`Nombre: ${displayName}`);
  console.log('\n⚠️  IMPORTANTE: Después de crear el usuario en Authentication, copia el UID generado.\n');

  await question('Presiona Enter después de crear el usuario y copiar el UID...');

  const uid = await question('\nPega el UID del usuario: ');

  console.log('\n📊 Ahora crea el documento en Firestore:\n');
  console.log('1. Ve a Firestore Database en Firebase Console');
  console.log('2. Click en "Start collection" o selecciona la colección "users"');
  console.log('3. Click en "Add document"');
  console.log(`4. Document ID: ${uid}`);
  console.log('\n5. Agrega estos campos:\n');
  console.log('   Field: id');
  console.log(`   Value: ${uid}`);
  console.log('\n   Field: email');
  console.log(`   Value: ${email}`);
  console.log('\n   Field: displayName');
  console.log(`   Value: ${displayName}`);
  console.log('\n   Field: role');
  console.log('   Value: admin');
  console.log('\n   Field: createdAt');
  console.log('   Type: timestamp');
  console.log('   Value: <now>');
  console.log('\n   Field: updatedAt');
  console.log('   Type: timestamp');
  console.log('   Value: <now>');
  console.log('\n6. Click en "Save"\n');

  await question('Presiona Enter cuando hayas terminado...');

  console.log('\n✅ ¡Listo! Ahora puedes:');
  console.log(`   1. Ir a http://localhost:5173/login`);
  console.log(`   2. Iniciar sesión con:`);
  console.log(`      Email: ${email}`);
  console.log(`      Password: ${password}`);
  console.log(`   3. Ir a /admin para crear más usuarios\n`);

  rl.close();
}

main().catch(console.error);
