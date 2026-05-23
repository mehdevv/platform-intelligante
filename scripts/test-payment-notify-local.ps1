# Test payment-notify (Mailjet). Use -Cloud if Docker is not installed (recommended on Windows).

param(
    [Parameter(Mandatory = $true)]
    [string] $Jwt,

    [Parameter(Mandatory = $true)]
    [string] $PaymentRequestId,

    [ValidateSet('created', 'reviewed')]
    [string] $Event = 'created',

    [switch] $Cloud,

    [string] $BaseUrl = ''
)

if (-not $BaseUrl) {
    if ($Cloud) {
        $envFile = Join-Path $PSScriptRoot "..\.env"
        $supabaseUrl = 'https://dakoclqbnocazrdhegqe.supabase.co'
        if (Test-Path $envFile) {
            Get-Content $envFile | ForEach-Object {
                if ($_ -match '^\s*VITE_SUPABASE_URL=(.+)$') {
                    $script:supabaseUrl = $matches[1].Trim().Trim('"')
                }
            }
        }
        $BaseUrl = "$supabaseUrl/functions/v1/payment-notify"
    } else {
        $BaseUrl = 'http://127.0.0.1:54321/functions/v1/payment-notify'
    }
}

$body = @{
    event               = $Event
    payment_request_id  = $PaymentRequestId
} | ConvertTo-Json

$headers = @{
    Authorization  = "Bearer $($Jwt.Trim())"
    'Content-Type' = 'application/json'
}

Write-Host "POST $BaseUrl (event=$Event)" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $BaseUrl -Method Post -Headers $headers -Body $body
    $response | ConvertTo-Json -Depth 6
    if ($response.emails) {
        foreach ($e in $response.emails) {
            if ($e.sent) {
                Write-Host "OK email -> $($e.to)" -ForegroundColor Green
            } else {
                Write-Host "SKIP/FAIL -> $($e.to): $($e.reason)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "Request failed:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    } else {
        Write-Host $_.Exception.Message
    }
    Write-Host "`nLocal: start Docker + npm run functions:payment-notify" -ForegroundColor DarkGray
    Write-Host "No Docker: deploy cloud function + use -Cloud flag. See docs/payment-notifications-local-test.md" -ForegroundColor DarkGray
    exit 1
}
