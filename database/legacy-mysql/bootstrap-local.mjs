import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';
const envPath = new URL('../backend/.env', import.meta.url);
try { await access(envPath); console.log('backend/.env already exists; skipping bootstrap.'); process.exit(0); } catch {}
const conn = await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root'});
const password = randomBytes(24).toString('hex'); const rootPassword = randomBytes(24).toString('hex'); const adminPassword = randomBytes(14).toString('base64url') + '!';
try {
 await conn.query('CREATE DATABASE IF NOT EXISTS nha_hoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
 await conn.query("CREATE USER IF NOT EXISTS 'nha_hoa'@'localhost' IDENTIFIED BY ?",[password]);
 await conn.query("GRANT ALL PRIVILEGES ON nha_hoa.* TO 'nha_hoa'@'localhost'");
 await conn.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[rootPassword]);
 await writeFile(envPath, `PORT=4000\nDB_HOST=127.0.0.1\nDB_PORT=3307\nDB_USER=nha_hoa\nDB_PASSWORD=${password}\nDB_NAME=nha_hoa\nFRONTEND_ORIGIN=http://127.0.0.1:5173\nADMIN_EMAIL=admin@nhahoa.local\nADMIN_PASSWORD=${adminPassword}\nNODE_ENV=development\n`);
 await writeFile(new URL('../.local/mysql-admin.txt',import.meta.url), `Local MySQL instance only, port 3307\nroot password: ${rootPassword}\n`);
 console.log('Isolated database configured. Admin credentials are in backend/.env.');
} finally { await conn.end(); }
