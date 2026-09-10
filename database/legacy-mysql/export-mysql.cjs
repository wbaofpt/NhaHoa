// One-time read-only export of the previous local database. Kept outside runtime dependencies.
const fs = require('node:fs');
const mysql = require('mysql2/promise');
const {parse} = require('dotenv');
(async () => {
 const env=parse(fs.readFileSync('backend/.env'));
 const connection=await mysql.createConnection({host:env.DB_HOST,port:Number(env.DB_PORT),user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME,dateStrings:true});
 try {
  await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
  await connection.query('START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY');
  const snapshot={};
  for(const table of ['users','products','orders','order_items','inquiries','subscribers']) { const [rows]=await connection.query('SELECT * FROM '+table);snapshot[table]=rows; }
  await connection.commit();
  fs.writeFileSync('.local/mysql-export.json',JSON.stringify(snapshot,null,2));
  console.log('Saved local migration snapshot:',Object.fromEntries(Object.entries(snapshot).map(([key,value])=>[key,value.length])));
 }finally{await connection.end();}
})().catch(error=>{console.error('Export failed:',error.code||error.name);process.exitCode=1;});
