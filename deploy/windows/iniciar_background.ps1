# ==============================================================================
# Inicia o Sistema em Segundo Plano (Ideal para SSH no Windows)
# ==============================================================================

$RootDir = Resolve-Path "$PSScriptRoot\..\.."
$BackendDir = "$RootDir\backend"
$FrontendDir = "$RootDir\frontend"

Write-Host "Iniciando Backend em segundo plano..." -ForegroundColor Cyan
Set-Location $BackendDir

# Garante que o .env existe
if (-not (Test-Path "$BackendDir\.env")) {
    Copy-Item "$BackendDir\.env.example" "$BackendDir\.env"
}

# Inicia o Uvicorn direcionando o log para backend.log
$pythonExe = "$BackendDir\venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python.exe"
}

Start-Process -FilePath $pythonExe `
    -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory $BackendDir `
    -RedirectStandardOutput "$BackendDir\backend_stdout.log" `
    -RedirectStandardError "$BackendDir\backend_stderr.log" `
    -WindowStyle Hidden

Write-Host "Iniciando Frontend em segundo plano..." -ForegroundColor Cyan
Set-Location $FrontendDir

# Garante que o build do frontend existe
if (-not (Test-Path "$FrontendDir\dist")) {
    Write-Host "Compilando frontend..." -ForegroundColor Yellow
    npm run build
}

# Inicia o frontend (preview ou dev)
Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run preview" `
    -WorkingDirectory $FrontendDir `
    -RedirectStandardOutput "$FrontendDir\frontend_stdout.log" `
    -RedirectStandardError "$FrontendDir\frontend_stderr.log" `
    -WindowStyle Hidden

Write-Host "`nSistema iniciado com sucesso em segundo plano!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000 (Logs em: backend\backend_stdout.log)"
Write-Host "Frontend: http://localhost:3000 (Logs em: frontend\frontend_stdout.log)"
