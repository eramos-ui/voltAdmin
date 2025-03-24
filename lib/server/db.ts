import sql from 'mssql';

// Singleton para evitar múltiples conexiones
const sqlConnection = {
  isConnected: 0 as 0 | 1,
  pool: null as sql.ConnectionPool | null,
};

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'as',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.NEXT_PUBLIC_FWK_BD || 'fotvAdmin',
  options: {
    trustServerCertificate: true,
    encrypt: true, // obligatorio si usas ngrok o conexiones remotas
  },
  port: Number(process.env.DB_PORT || 1433),
  connectionTimeout: 30000,
};

export async function connectToDB(): Promise<sql.ConnectionPool> {
  if (sqlConnection.isConnected && sqlConnection.pool) {
    return sqlConnection.pool;
  }

  try {
    const pool = await sql.connect(dbConfig);
    sqlConnection.isConnected = 1;
    sqlConnection.pool = pool;
    console.log('✅ Conexión a SQL Server establecida');
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a SQL Server:', error);
    throw error;
  }
}






// import sql from 'mssql';

// // Configuración de la conexión desde las variables de entorno
// const config = {
//   user: process.env.DB_USER || 'demo_user',
//   password: process.env.DB_PASSWORD || 'user_demo',
//   server: process.env.DB_SERVER || '0.tcp.sa.ngrok.io',
//   port: parseInt(process.env.DB_PORT || '13809'),
//   database: process.env.DB_NAME || 'fotvAdmin',
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//     connectionTimeout: 50000,
//     requestTimeout: 50000,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// };

// // Clase para manejar la conexión a la BD
// class Database {
//   constructor() {
//     this.pool = null;
//   }

//   // Conectar a la BD
//   async connect() {
//     //   console.log('config connect',config);
//     try {
//       if (!this.pool) {
//         this.pool = await sql.connect(config);
//         console.log('Conexión a SQL Server establecida');
//       }
//       return this.pool;
//     } catch (error) {
//       console.error('Error al conectar con SQL Server:', error);
//       throw error;
//     }
//   }

//   // Ejecutar consulta SQL
//   async query(queryString, params = []) {
//     try {
//       const pool = await this.connect();
//       const request = pool.request();
      
//       // Agregar parámetros si existen
//       if (params) {
//         params.forEach((param, index) => {
//           request.input(`param${index}`, param);
//         });
//       }
      
//       const result = await request.query(queryString);
//       return result;
//     } catch (error) {
//       console.error('Error al ejecutar consulta:', error);
//       throw error;
//     }
//   }

//   // Ejecutar procedimiento almacenado
//   async executeProcedure(procedureName, parameters = {}) {
//     try {
//       const pool = await this.connect();
//       const request = pool.request();
      
//       // Agregar parámetros si existen
//       if (parameters) {
//         for (const key in parameters) {
//           request.input(key, parameters[key]);
//         }
//       }
      
//       const result = await request.execute(procedureName);
//       return result;
//     } catch (error) {
//       console.error('Error al ejecutar procedimiento almacenado:', error);
//       throw error;
//     }
//   }
// }

// // Exportar una única instancia para todo el proyecto
// const database = new Database();
// export default database; 