import database from '@/lib/db';
import { executeQueryOne } from '@/lib/server/spExecutor';

/**
 * Repositorio de Usuarios
 */
class UserRepository {
  /**
   * Obtiene todos los usuarios
   */
  async getAll() {
    return await executeQueryOne('loadUsuario');
  }

  /**
   * Obtiene un usuario por su ID
   * @param {number} id - ID del usuario
   */
  async getById(id) {
    return await executeQueryOne('sp_GetUserById', { id });
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   */
  async create(userData) {
    const parameters = getParametersFromBody(userData);
    return await executeQueryOne('sp_CreateUser', parameters);

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

  /**
   * Elimina un usuario
   * @param {number} id - ID del usuario
   */
  async delete(id) {
    return await executeQueryOne('sp_DeleteUser', { id });
  }
}

// Exportar una instancia única
const userRepository = new UserRepository();
export default userRepository; 