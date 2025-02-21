// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   try {
//     // Intenta hacer una simple consulta para probar la conexión
//     await prisma.$connect();
//     console.log('Conexión exitosa a la base de datos');

//     // Aquí podrías hacer cualquier otra consulta rápida para verificar
//     const users = await prisma.user.findMany();
//     console.log('Usuarios en la base de datos:', users);
//   } catch (error) {
//     console.error('Error al conectar a la base de datos:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
