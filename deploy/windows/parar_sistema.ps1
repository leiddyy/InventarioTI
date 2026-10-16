# ==============================================================================
# Para os processos do Backend e Frontend no Windows
# ==============================================================================

Write-Host "Localizando processos do Inventario TI..." -ForegroundColor Cyan

# Parar portas 8000 e 3000
$portas = @(8000, 3000)

foreach ($porta in $portas) {
    $connections = Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "Encerrando processo na porta $porta (PID: $pidToKill)..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "Nenhum processo escutando na porta $porta." -ForegroundColor Gray
    }
}

Write-Host "Serviços interrompidos com sucesso." -ForegroundColor Green
