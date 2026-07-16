$ErrorActionPreference = "Stop"

$poolerFile = "supabase\.temp\pooler-url"
$envFile = ".env"
if (-not (Test-Path -LiteralPath $poolerFile)) {
  throw "Supabase is not linked. Run: npx supabase link"
}
if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Local .env file is missing."
}

$securePassword = Read-Host "Supabase database password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  $encodedPassword = [Uri]::EscapeDataString($plainPassword)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}

$poolerWithoutPassword = (Get-Content -Raw -LiteralPath $poolerFile).Trim()
if ($poolerWithoutPassword -notmatch '^postgresql://([^@]+)@(.+):5432/(.+)$') {
  throw "Unexpected Supabase pooler URL format."
}

$databaseUser = $Matches[1]
$databaseHost = $Matches[2]
$databaseName = $Matches[3]
$directUrl = "postgresql://${databaseUser}:${encodedPassword}@${databaseHost}:5432/${databaseName}?sslmode=require&uselibpqcompat=true"
$databaseUrl = "postgresql://${databaseUser}:${encodedPassword}@${databaseHost}:6543/${databaseName}?sslmode=require&uselibpqcompat=true"

function Set-LocalEnvironmentValue([string]$Name, [string]$Value) {
  $content = Get-Content -Raw -LiteralPath $envFile
  $line = "$Name=`"$Value`""
  if ($content -match "(?m)^$([regex]::Escape($Name))=") {
    $content = [regex]::Replace($content, "(?m)^$([regex]::Escape($Name))=.*$", $line)
  } else {
    $content = $content.TrimEnd() + [Environment]::NewLine + $line + [Environment]::NewLine
  }
  [IO.File]::WriteAllText((Resolve-Path $envFile), $content, [Text.UTF8Encoding]::new($false))
}

Set-LocalEnvironmentValue "DATABASE_URL" $databaseUrl
Set-LocalEnvironmentValue "DIRECT_URL" $directUrl
$env:DATABASE_URL = $databaseUrl
$env:DIRECT_URL = $directUrl

$plainPassword = $null
$encodedPassword = $null
$securePassword = $null
$databaseUrl = $null
$directUrl = $null

try {
  npm.cmd run db:generate
  if ($LASTEXITCODE -ne 0) { throw "Prisma client generation failed." }

  npm.cmd run db:deploy
  if ($LASTEXITCODE -ne 0) { throw "Prisma migration deployment failed." }

  npm.cmd run db:seed
  if ($LASTEXITCODE -ne 0) { throw "Development seed failed." }

  Write-Host "Supabase is configured locally and the development admin was seeded." -ForegroundColor Green
} finally {
  $env:DATABASE_URL = $null
  $env:DIRECT_URL = $null
}
