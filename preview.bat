@echo off
title Jacob's Cyberpunk Playground - Local Server
echo ========================================================
echo   JACOB'S PLAYGROUND // LOCAL CYBERPUNK SERVER
echo ========================================================
echo   URL: http://localhost:8000/website/index.html
echo   Press Ctrl+C in this terminal window to stop the server.
echo ========================================================
start http://localhost:8000/website/index.html
powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host 'Server active on http://localhost:8000/'; while($listener.IsListening) { try { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $relPath = $req.Url.AbsolutePath.TrimStart('/'); if ([string]::IsNullOrEmpty($relPath)) { $relPath = 'website/index.html' }; $fullPath = Join-Path (Get-Location) $relPath; if (Test-Path $fullPath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($fullPath); $res.ContentLength64 = $bytes.Length; $ext = [System.IO.Path]::GetExtension($fullPath).ToLower(); switch ($ext) { '.html' { $res.ContentType = 'text/html; charset=utf-8' } '.css' { $res.ContentType = 'text/css; charset=utf-8' } '.js' { $res.ContentType = 'application/javascript; charset=utf-8' } '.svg' { $res.ContentType = 'image/svg+xml' } '.png' { $res.ContentType = 'image/png' } '.jpg' { $res.ContentType = 'image/jpeg' } '.jpeg' { $res.ContentType = 'image/jpeg' } default { $res.ContentType = 'application/octet-stream' } }; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404 }; $res.Close() } catch { break } }"
