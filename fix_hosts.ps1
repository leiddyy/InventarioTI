$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$lines = Get-Content $hostsPath | Where-Object { $_ -notmatch 'inventario' }
$lines += "127.0.0.1 inventario"
$lines += "127.0.0.1 inventario.dia"
Set-Content -Path $hostsPath -Value $lines -Encoding utf8
ipconfig /flushdns
