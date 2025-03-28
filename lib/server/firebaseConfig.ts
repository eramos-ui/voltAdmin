

// import { initializeApp, cert } from 'firebase-admin/app';
// import { getStorage } from 'firebase-admin/storage';
// import { readFileSync } from 'fs';
// import path from 'path';

// const serviceAccountPath = path.join(process.cwd(), 'credentials/firebase-service-account.json');
// const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// const app = initializeApp({
//   credential: cert(serviceAccount),
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// });

// export const bucket = getStorage(app).bucket();

// lib/server/firebaseConfig.ts
// import admin from 'firebase-admin';
// import path from 'path';
// import { readFileSync } from 'fs';

// const serviceAccountPath = path.resolve(process.cwd(), 'credentials/firebase-service-account.json');

// if (!admin.apps.length) {
//   const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // debe estar en .env
//     //storageBucket: 'zustand-store-3df8b', 
//   });

//   console.log('✅ Firebase Admin inicializado');
// }

// const bucket = admin.storage().bucket();

// export { admin, bucket };
import admin from 'firebase-admin';
//import serviceAccount from '@/credentials/firebase-service-account.json';
// const serviceAccount = JSON.parse(
//   process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
// );
if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // reemplaza con tu bucket real si es distinto
  });
}

export const bucket = admin.storage().bucket();
export default admin;
