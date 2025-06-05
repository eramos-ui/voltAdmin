

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fvoltadmin?replicaSet=rs0';


if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI no está definido en las variables de entorno.');
}
let cachedClient: MongoClient | null = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('✅ Ya conectado a MongoDB');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      retryWrites: true, // importante para transacciones
      w: 'majority',     // asegura confirmación de escritura
    });

    console.log('✅ Conexión a MongoDB exitosa ',MONGODB_URI);
  } catch (error: any) {
    console.error('🔴 Error al conectar a MongoDB:', error);
    throw error;
  }
};

/**
 * Obtiene la instancia de la base de datos para GridFS
 */
export const getDatabase = async () => {
  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(MONGODB_URI);
      await cachedClient.connect();
      console.log('✅ Cliente de MongoDB conectado para GridFS');
    } catch (error) {
      console.error('🔴 Error al conectar a MongoDB para GridFS:', error);
      throw error;
    }
  }

  return cachedClient.db();
};



// import mongoose from 'mongoose';

// const MONGODB_URI= process.env.MONGODB_URI || 'mongodb://localhost:27017/fotvadmin';

// export const connectDB = async () => {
//     try {
//       if (mongoose.connection.readyState >= 1) {
//         console.log('✅ Ya conectado a MongoDB');
//         return;
//       }
//         await mongoose.connect(MONGODB_URI);
//         console.log('✅ Conexión a MongoDB exitosa');
//       } catch (error: any) {
//         console.error('🔴 Error al conectar a MongoDB:', error);
//         throw error;
//       }
// };