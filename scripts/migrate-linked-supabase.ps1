$ErrorActionPreference = "Stop"

$poolerFile = "supabase\.temp\pooler-url"
if (-not (Test-Path -LiteralPath $poolerFile)) {
  throw "Supabase is not linked. Run: npx supabase link"
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
$env:DIRECT_URL = "postgresql://${databaseUser}:${encodedPassword}@${databaseHost}:5432/${databaseName}?sslmode=require&uselibpqcompat=true"
$env:DATABASE_URL = "postgresql://${databaseUser}:${encodedPassword}@${databaseHost}:6543/${databaseName}?sslmode=require&uselibpqcompat=true"

$plainPassword = $null
$encodedPassword = $null
$securePassword = $null

try {
  npm.cmd run db:validate
  if ($LASTEXITCODE -ne 0) { throw "Prisma schema validation failed." }

  npm.cmd run db:deploy
  if ($LASTEXITCODE -ne 0) { throw "Prisma migration deployment failed." }

  Write-Host "All Prisma migrations were applied to the linked Supabase project." -ForegroundColor Green
} finally {
  $env:DIRECT_URL = $null
  $env:DATABASE_URL = $null
}
