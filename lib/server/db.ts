// import sql from 'mssql';

// // Singleton para evitar múltiples conexiones
// const sqlConnection = {
//   isConnected: 0 as 0 | 1,
//   pool: null as sql.ConnectionPool | null,
// };

// // Función para parsear DATABASE_URL si está definida
// function getDbConfig(): sql.config {
//   const databaseUrl = process.env.DATABASE_URL;
//   // console.log('en db.ts databaseUrl', databaseUrl);
//   if (databaseUrl) {
//     const parsed = new URL(databaseUrl);
//     const [user, password] = parsed.username
//       ? [parsed.username, parsed.password]
//       : [undefined, undefined];

//     return {
//       user,
//       password,
//       server: parsed.hostname,
//       port: parseInt(parsed.port || '1433', 10),
//       database: parsed.searchParams.get('database') || '',
//       options: {
//         trustServerCertificate: true,
//         encrypt: true,
//       },
//       connectionTimeout: 30000,
//     };
//   }

//   // Fallback local
//     // console.log('En getDbConfig process.env.DB_USER',process.env.DB_USER,process.env.DB_PASSWORD,process.env.DB_SERVER,process.env.DB_NAME);
//   return {
//     user: process.env.DB_USER || 'sa',
//     password: process.env.DB_PASSWORD || 'as',
//     server: process.env.DB_SERVER || 'localhost',
//     database: process.env.DB_NAME || 'fotvAdmin',
//     options: {
//       trustServerCertificate: true,
//       encrypt: true,
//     },
//     port: Number(process.env.DB_PORT || 1433),
//     connectionTimeout: 180000,
//     requestTimeout: 180000,
//   };
// }

// export async function connectToDB(): Promise<sql.ConnectionPool> {
  
//   if (sqlConnection.isConnected && sqlConnection.pool) {
//     // console.log('✅ En connectToDB ya existe una conexión',sqlConnection.pool);
//     return sqlConnection.pool;
//   }

//   try {
//     const config = getDbConfig();
//     const pool = await sql.connect(config);
//     sqlConnection.isConnected = 1;
//     sqlConnection.pool = pool;
//     // console.log('✅ En getDbConfig Conexión a SQL Server establecida');
//     return pool;
//   } catch (error) {
//     console.error('❌ Error conectando a SQL Server:', error);
//     throw error;
//   }
// }