param(
	[string]$SpeechText = 'In my previous internship I improved API response time by thirty percent by optimizing database queries and caching frequently used endpoints.'
)

$ErrorActionPreference = 'Stop'

try {
	Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/health' -TimeoutSec 5 | Out-Null
} catch {
	Write-Output 'AI_ANALYSER_TEST_FAIL: backend is not running on 8080'
	exit 1
}

$email = 'ai.tester.' + ([guid]::NewGuid().ToString('N').Substring(0, 8)) + '@mail.com'
$password = 'Test@12345'

$regBody = @{ name = 'AI Tester'; email = $email; password = $password; college = 'InterviewSim' } | ConvertTo-Json -Compress
try {
	Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/auth/register' -ContentType 'application/json' -Body $regBody | Out-Null
} catch {
}

$loginBody = @{ email = $email; password = $password } | ConvertTo-Json -Compress
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/auth/login' -ContentType 'application/json' -Body $loginBody
$token = $login.data.token
if (-not $token) {
	Write-Output 'AI_ANALYSER_TEST_FAIL: login token missing'
	exit 1
}

$questions = Invoke-RestMethod -Method Get -Uri 'http://localhost:8080/api/behavioral/questions' -Headers @{ Authorization = "Bearer $token" }
$questionId = [string]$questions.data[0].id
if (-not $questionId) {
	$questionId = '0'
}

Add-Type -AssemblyName System.Speech
$speechPath = 'C:\html\interviewsim\backend\tmp_ai_test.wav'
$videoPath = 'C:\html\interviewsim\backend\tmp_ai_test.mp4'

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile($speechPath)
$synth.Speak($SpeechText)
$synth.Dispose()

$ff = 'C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe'
if (-not (Test-Path $ff)) {
	$ff = 'ffmpeg'
}

& $ff -y -f lavfi -i color=c=black:s=640x360:d=10 -i $speechPath -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac $videoPath | Out-Null

if (-not (Test-Path $videoPath)) {
	Write-Output 'AI_ANALYSER_TEST_FAIL: test video generation failed'
	exit 1
}

$response = curl.exe -s -X POST 'http://localhost:8080/api/user/behavioral-submit' -H "Authorization: Bearer $token" -F "video=@$videoPath" -F "questionId=$questionId" -F 'facePresenceScore=92'

try {
	$parsed = $response | ConvertFrom-Json
	Write-Output "AI_ANALYSER_RESULT: contentScore=$($parsed.data.contentScore) finalScore=$($parsed.data.finalScore) transcriptLen=$($parsed.data.transcript.Length)"
	if ($parsed.data.weaknesses) {
		Write-Output ('AI_ANALYSER_WEAKNESSES: ' + ($parsed.data.weaknesses -join ' | '))
	}
} catch {
}

Write-Output 'AI_ANALYSER_RESPONSE_START'
Write-Output $response
Write-Output 'AI_ANALYSER_RESPONSE_END'
