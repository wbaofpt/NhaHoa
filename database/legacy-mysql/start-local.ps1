$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$mysqlBinary = 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe'
$localDir = Join-Path $projectRoot '.local'
$dataDir = Join-Path $localDir 'mysql-data'
if (-not (Test-Path -LiteralPath $mysqlBinary)) { throw 'MySQL binary not found. Use database/docker-compose.yml or configure your MySQL connection in backend/.env.' }
if (-not (Test-Path -LiteralPath $dataDir)) { throw 'Local data directory is missing. See README.md for initial database setup.' }
$listener = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
if ($listener) { Write-Host 'Port 3307 is already listening. Verify npm run db:setup or /api/health.'; exit 0 }
Start-Process -FilePath $mysqlBinary -ArgumentList '--no-defaults','--basedir="C:/Program Files/MySQL/MySQL Server 8.0"',("--datadir=" + $dataDir), '--port=3307','--bind-address=127.0.0.1','--mysqlx=0','--console' -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localDir 'mysql-stdout.log') -RedirectStandardError (Join-Path $localDir 'mysql-stderr.log')
Write-Host 'Started isolated MySQL on 127.0.0.1:3307.'
