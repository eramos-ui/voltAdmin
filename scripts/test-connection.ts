const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'zzz',
  server: 'localhost', 
  database: 'houleCfg',
  options: {
    trustServerCertificate: true,
  }
};

sql.connect(config)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((err:unknown) => {
    console.error('Error al conectar a la base de datos:', err);
  })
  .finally(() => {
    sql.close();
  });
//scripts\test-connection.ts  D:\nextProject\my-sidebar-project\scripts\test-connection.ts