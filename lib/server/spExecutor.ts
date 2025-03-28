import sql, {   ISqlTypeFactory, ISqlTypeFactoryWithLength } from 'mssql';
import { connectToDB } from './db';
// Singleton para evitar múltiples conexiones
// const sqlConnection = {
//   isConnected: 0 as 0 | 1,
//   pool: null as sql.ConnectionPool | null,
// };

// const dbConfig: SQLConfig = {
//   user: process.env.DB_USER || 'sa',
//   password: process.env.DB_PASSWORD || 'as',
//   server: process.env.DB_SERVER || 'localhost',
//   database: process.env.NEXT_PUBLIC_FWK_BD || 'fotvAdmin',
//   options: {
//     trustServerCertificate: true,
//     encrypt: true, // obligatorio si usas ngrok o conexiones remotas
//   },
//   port: Number(process.env.DB_PORT || 1433),
//   connectionTimeout: 30000,
// };

// export const connectToDB = async (): Promise<ConnectionPool> => {
//   if (sqlConnection.isConnected && sqlConnection.pool) {
//     return sqlConnection.pool;
//   }
//   console.log('en spExecutor.ts dbConfig', dbConfig);

//   try {
//     const pool: ConnectionPool = await sql.connect(dbConfig);
//     sqlConnection.isConnected = 1;
//     sqlConnection.pool = pool;
//     console.log('✅ Conexión a SQL Server establecida');
//     return pool;
//   } catch (error) {
//     console.error('❌ Error conectando a SQL Server:', error);
//     console.log('🔍 Detalles de configuración usada:', dbConfig);
//     throw error;
//   }
// };

// Ejecuta un SP que devuelve varias filas
export const executeSP = async <T = any>(
  spName: string,
  params: { name: string; type: ISqlTypeFactory; value: any }[] = []
): Promise<any[]> => {
  try {
    console.log(`▶️ Ejecutando SP: ${spName} con nro. params:`, params.length);
    const pool = await connectToDB();
    const request = pool.request();
        params.forEach(param => {
        request.input(param.name, param.type as any, param.value);
      });
    // params.forEach(param => request.input(param.name, param.type(), param.value));
    const result = await request.execute(spName);
    console.log(`✅ SP ejecutado correctamente: ${spName}`);
    return result.recordset;
  } catch (error) {
    console.error(`❌ Error ejecutando SP "${spName}" con parámetros:`, params);
    console.error('🧨 Detalles del error:', error);
    throw error;
  }
};

// Ejecuta un SP que devuelve una sola fila

export const executeSPOne = async (
  spName: string,
  params: { name: string; type: ISqlTypeFactory; value: any }[] = []
): Promise<any | null> => {
  try {
    console.log(`▶️ Ejecutando executeSPOne para: ${spName}`);
    const pool = await connectToDB();
    const request = pool.request();

    params.forEach((param) => {
      request.input(param.name, param.type as any, param.value);
    });

    const result = await request.execute(spName);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(`❌ Error ejecutando executeSPOne("${spName}")`);
    console.error('🧨 Detalles del error:', error);
    throw error;
  }
};
// export const executeSPOne = async (
//   spName: string,
//   params: { name: string; type: ISqlTypeFactory; value: any }[] = []
// ): Promise<any | null> => {
//   try {
//     console.log(`▶️ Ejecutando executeSPOne para: ${spName}`);
//     const rows = await executeSP(spName, params);
//     return rows.length > 0 ? rows[0] : null;
//   } catch (error) {
//     console.error(`❌ Error ejecutando executeSPOne("${spName}")`);
//     console.error('🧨 Detalles del error:', error);
//     throw error;
//   }
// };
// Ejecuta una consulta SQL directa que puede devolver varias filas
export const executeQuery = async <T = any>(
  query: string,
  params: { name: string; type: ISqlTypeFactory; value: any }[] = []
): Promise<T[]> => {
  try {
    console.log(`📥 Ejecutando consulta: "${query}" con params:`, params);

    const pool = await connectToDB();
    const request = pool.request();

    params.forEach((param) => {
      request.input(param.name, param.type as any, param.value);
    });

    const result = await request.query(query);

    console.log(`✅ Consulta ejecutada correctamente (${result.recordset.length} filas)`);

    return result.recordset;
  } catch (error) {
    console.error(`❌ Error ejecutando consulta SQL: "${query}"`);
    console.error('🧨 Detalles del error:', error);
    throw error;
  }
};

// export const executeQuery = async <T = any>(
//     query: string,
//     params: { name: string; type: ISqlTypeFactory; value: any }[] = []
//   ): Promise<any[]> => {
//     try {
//       console.log(`📥 Ejecutando consulta: "${query}" con params:`, params);
  
//       const pool = await connectToDB();
//       const request = pool.request();
//       params.forEach(param => {
//         request.input(param.name, param.type as any, param.value);
//       });
//       const result = await request.query(query);
  
//       console.log(`✅ Consulta ejecutada correctamente (${result.recordset.length} filas)`);
  
//       return result.recordset;
//     } catch (error) {
//       console.error(`❌ Error ejecutando consulta SQL: "${query}"`);
//       console.error(error);
//       throw error;
//     }
//   };
  export const executeNonQuery = async (
    procedureName: string,
    params: { name: string; type: ISqlTypeFactory; value: any }[] = []
  ): Promise<number | boolean> => {
    try {
      const pool = await connectToDB();
      const request = pool.request();

      params.forEach(param => {
        request.input(param.name, param.type as any, param.value);
      });

      const result = await request.execute(procedureName);

      return result.rowsAffected[0] ?? true;
    } catch (error) {
      console.error(`❌ Error ejecutando SP "${procedureName}"`, error);
      throw error;
    }
  };
  // Ejecuta una consulta SQL directa que devuelve una sola fila
  export const executeQueryOne = async (
    query: string,
    params: { name: string; type: ISqlTypeFactory; value: any }[] = []
  ): Promise<any | null> => {
    const rows = await executeQuery(query, params);
    return rows.length > 0 ? rows[0] : null;
  };

  // import { dbConfig } from './config'; // Asegúrate de tener tu configuración aquí
  
  // interface SqlParameter {
  //   name: string;
  //   type: sql.ISqlTypeFactory | sql.ISqlType;
  //   value: any;
  // }
    /**
   * Ejecuta un stored procedure sin devolver resultados (UPDATE, DELETE, INSERT)
   * @param procedureName - Nombre del procedimiento almacenado
   * @param params - Arreglo de parámetros
   * @returns Número de filas afectadas o true si fue exitoso
   */
  // export const executeNonQuery = async (
  //   procedureName: string,
  //   params: { name: string; type: ISqlTypeFactory; value: any }[] = []
  // ): Promise<number | boolean> => {
  //   try {
  //     const pool = await sql.connect(dbConfig);
  //     const request = pool.request();
  
  //     params.forEach(param => {
  //       request.input(param.name, param.type as any, param.value);
  //     });
  
  //     const result = await request.execute(procedureName);
  
  //     // Puede devolver número de filas afectadas o true
  //     return result.rowsAffected[0] ?? true;
  //   } catch (error) {
  //     console.error(`❌ Error ejecutando SP "${procedureName}"`, error);
  //     throw error;
  //   }
  // };
  

export interface SPParam {
  name: string;
  type: ISqlTypeFactoryWithLength | sql.ISqlType;
  value: any;
}

// export const executeSPScalar = async (
//   procedureName: string,
//   params: SPParam[] = []
// ): Promise<Record<string, any> | null> => {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const request = pool.request();

//     params.forEach((param) =>
//       request.input(param.name, param.type as sql.ISqlType, param.value)
//     );

//     const result = await request.execute(procedureName);

//     if (result.recordset.length > 0) {
//       return result.recordset[0];
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error(`❌ Error ejecutando SP "${procedureName}":`, error);
//     return null;
//   }
// };
export const executeSPScalar = async (
  procedureName: string,
  params: SPParam[] = []
): Promise<Record<string, any> | null> => {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    params.forEach((param) =>
      request.input(param.name, param.type as sql.ISqlType, param.value)
    );

    const result = await request.execute(procedureName);
    console.log(`✅ En executeSPScalar ${procedureName}`);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(`❌ Error en executeSPScalar SP "${procedureName}":`, error);
    return null;
  }
};