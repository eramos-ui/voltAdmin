
const sql = require('@jsonData'); 

import { dbconfig } from './db';

const dbConnection = async() =>{
  try{
    // console.log(dbconfig);
     await sql.connect( dbconfig  );
    console.log('DB Online');
  }catch (error){
    console.log(err);
    throw new Error('Error al conectar BD');   
  }
}
export default  dbConnection;
