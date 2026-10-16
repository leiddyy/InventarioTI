# ==============================================================================
# Registra Tarefa Agendada no Windows para Iniciar o Sistema no Boot da VM
# Execute no PowerShell como Administrador
# ==============================================================================

$ScriptPath = Resolve-Path "$PSScriptRoot\iniciar_background.ps1"
$TaskName = "InventarioTI_AutoStart"

Write-Host "Criando Tarefa Agendada para inicializacao automatica: $TaskName" -ForegroundColor Cyan

$Action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -NoProfile -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -AtStartup

$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Remove tarefa existente se houver
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Registra a nova tarefa
Register-ScheduledTask -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Principal $Principal `
    -Settings $Settings

Write-Host "Tarefa agendada '$TaskName' criada com sucesso!" -ForegroundColor Green
Write-Host "O sistema iniciara automaticamente sempre que a maquina virtual Windows ligar ou reiniciar." -ForegroundColor Green
