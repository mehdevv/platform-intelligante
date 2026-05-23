# Push Mailjet vars from supabase/.env.local to your linked Supabase project (cloud).
# Run once: npx supabase login && npx supabase link --project-ref dakoclqbnocazrdhegqe

$envPath = Join-Path $PSScriptRoot "..\supabase\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Error "Missing $envPath"
    exit 1
}

$vars = @{}
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_ -split '=', 2
    $vars[$k.Trim()] = $v.Trim().Trim('"')
}

$required = @('MAILJET_API_KEY', 'MAILJET_SECRET_KEY', 'NOTIFY_FROM_EMAIL', 'SITE_URL')
foreach ($k in $required) {
    if (-not $vars[$k]) {
        Write-Error "Missing $k in supabase/.env.local"
        exit 1
    }
}

Write-Host "Setting Supabase Edge Function secrets..." -ForegroundColor Cyan
npx supabase secrets set `
    "MAILJET_API_KEY=$($vars.MAILJET_API_KEY)" `
    "MAILJET_SECRET_KEY=$($vars.MAILJET_SECRET_KEY)" `
    "NOTIFY_FROM_EMAIL=$($vars.NOTIFY_FROM_EMAIL)" `
    "SITE_URL=$($vars.SITE_URL)"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Deploy with: npm run functions:deploy:payment-notify" -ForegroundColor Green
}
