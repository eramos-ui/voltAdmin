import database from '@/lib/db';
//import { exeOnePro2, exePro2, getParametersFromBody } from '@/helpers/exe';
import { executeQueryOne } from '@/lib/server/spExecutor';
//import { Prisma Client } from '@prisma /client'; 

// Configuración
//const USE_MSSQL = process.env.USE_MSSQL === 'true'; // Variable de entorno para cambiar la implementación
//const prisma = new Prisma Client();

/**
 * Repositorio de Usuarios
 * Fachada que puede usar mssql o prisma según configuración
 */
class UserRepository {
  /**
   * Obtiene todos los usuarios
   */
  async getAll() {
    return await executeQueryOne('loadUsuario');
  }
  // async getAll() {
  //   if (USE_MSSQL) {
  //     // Implementación con mssql
  //     return await exePro2('loadUsuario');
  //   } else {
  //     // Implementación con Prisma
  //     return await prisma.user.findMany();
  //   }
  // }

  /**
   * Obtiene un usuario por su ID
   * @param {number} id - ID del usuario
   */
  async getById(id) {
    return await executeQueryOne('sp_GetUserById', { id });
  }
  // async getById(id) {
  //   if (USE_MSSQL) {
  //     // Implementación con mssql
  //     return await exeOnePro2('sp_GetUserById', { id });
  //   } else {
  //     // Implementación con Prisma
  //     return await prisma.user.findUnique({
  //       where: { id }
  //     });
  //   }
  // }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   */
  async create(userData) {
    const parameters = getParametersFromBody(userData);
    return await executeQueryOne('sp_CreateUser', parameters);
    // if (USE_MSSQL) {
    //   // Implementación con mssql
    //   const parameters = getParametersFromBody(userData);
    //   return await exeOnePro2('sp_CreateUser', parameters);
    // } else {
    //   // Implementación con Prisma
    //   return await prisma.user.create({
    //     data: userData
    //   });
    // }
  }

  /**
   * Actualiza un usuario
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   */
  async update(id, userData) {
    const parameters = { id, ...getParametersFromBody(userData) };
    return await executeQueryOne('sp_UpdateUser', parameters);
  }
  // async update(id, userData) {
  //   if (USE_MSSQL) {
  //     // Implementación con mssql
  //     const parameters = { 
  //       id,
  //       ...getParametersFromBody(userData)
  //     };
  //     return await exeOnePro2('sp_UpdateUser', parameters);
  //   } else {
  //     // Implementación con Prisma
  //     return await prisma.user.update({
  //       where: { id },
  //       data: userData
  //     });
  //   }
  // }

  /**
   * Elimina un usuario
   * @param {number} id - ID del usuario
   */
  async delete(id) {
    return await executeQueryOne('sp_DeleteUser', { id });
  }
  // async delete(id) {
  //   if (USE_MSSQL) {
  //     // Implementación con mssql
  //     return await exeOnePro2('sp_DeleteUser', { id });
  //   } else {
  //     // Implementación con Prisma
  //     return await prisma.user.delete({
  //       where: { id }
  //     });
  //   }
  // }
}

// Exportar una instancia única
const userRepository = new UserRepository();
export default userRepository; 