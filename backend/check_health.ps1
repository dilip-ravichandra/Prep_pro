$status = curl.exe -s -o NUL -w "%{http_code}" "http://localhost:8080/api/auth/health"
Write-Output "BACKEND_HTTP=$status"
