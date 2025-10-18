/**
 * Script helper para crear el primer usuario admin
 * 
 * INSTRUCCIONES:
 * 
 * 1. Primero regístrate normalmente en la app en /register
 * 2. Anota tu email y UID (lo verás en la consola del navegador o en Firebase Auth)
 * 3. Ve a Firebase Console > Firestore Database
 * 4. Busca: users > [tu-uid]
 * 5. Edita el documento y cambia: role: "user" → role: "admin"
 * 
 * O alternativamente, usa este código en la consola del navegador después de registrarte:
 * 
 * // Pega esto en la consola del navegador (DevTools)
 * import { doc, updateDoc } from 'firebase/firestore';
 * import { db } from './firebase/firebase';
 * 
 * const uid = 'TU_UID_AQUI'; // Reemplaza con tu UID
 * await updateDoc(doc(db, 'users', uid), { role: 'admin' });
 * console.log('Usuario convertido a admin exitosamente');
 * 
 */

// Este archivo es solo documentación
export const SETUP_INSTRUCTIONS = {
  step1: 'Registrarse en /register con email y contraseña',
  step2: 'Ir a Firebase Console: https://console.firebase.google.com/project/finances-92740',
  step3: 'Navegar a Firestore Database',
  step4: 'Abrir colección "users" y buscar tu documento por UID',
  step5: 'Editar campo "role" de "user" a "admin"',
  step6: 'Refrescar la app y ya tendrás permisos de admin',
};

/**
 * USUARIOS DE PRUEBA RECOMENDADOS:
 * 
 * Admin:
 * - Email: admin@finanzas.app
 * - Password: admin123
 * - Role: admin
 * 
 * Usuario regular:
 * - Email: usuario@finanzas.app
 * - Password: user123
 * - Role: user
 */
