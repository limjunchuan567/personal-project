$ErrorActionPreference = 'SilentlyContinue'
$port = 8080

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Auto-detect local Wi-Fi / LAN IP address
$localIp = 'localhost'
try {
  $foundIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { ($_.InterfaceAlias -like '*Wi-Fi*' -or $_.InterfaceAlias -like '*Ethernet*' -or $_.InterfaceAlias -like '*WLAN*') -and $_.IPAddress -notlike '169.254*' -and $_.IPAddress -ne '127.0.0.1' } |
    Select-Object -First 1).IPAddress
  if ($foundIp) { $localIp = $foundIp }
} catch {}

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.pdf'  = 'application/pdf'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()

Clear-Host
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   JACOB'S PLAYGROUND // LOCAL CYBERPUNK SERVER         " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [PC Browser]    http://localhost:$port/website/index.html" -ForegroundColor Green
Write-Host "   [Phone Browser] http://${localIp}:$port/website/index.html" -ForegroundColor Magenta
Write-Host ""
Write-Host "   * Phone and PC must be connected to the same Wi-Fi!" -ForegroundColor DarkGray
Write-Host "   * Press Ctrl+C in this terminal window to stop." -ForegroundColor DarkGray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

try {
  Start-Process "http://localhost:$port/website/index.html"
} catch {}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $stream.ReadTimeout = 3000
      $stream.WriteTimeout = 3000
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII)
      $reqLine = $reader.ReadLine()
      if ($reqLine) {
        $parts = $reqLine.Split(' ')
        if ($parts.Length -ge 2) {
          $method = $parts[0]
          $rawUrl = $parts[1]
          $cleanPath = $rawUrl.Split('?')[0].TrimStart('/')
          if ([string]::IsNullOrWhiteSpace($cleanPath)) {
            $cleanPath = 'website/index.html'
          }
          $filePath = [System.IO.Path]::Combine($root, $cleanPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

          if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`n" +
                      "Content-Type: $contentType`r`n" +
                      "Content-Length: $($bytes.Length)`r`n" +
                      "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
                      "Access-Control-Allow-Origin: *`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD') {
              $stream.Write($bytes, 0, $bytes.Length)
            }
          } else {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $cleanPath")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($msg, 0, $msg.Length)
          }
        }
      }
    } catch {}
    finally {
      if ($client) { $client.Close() }
    }
  }
} finally {
  $listener.Stop()
}
