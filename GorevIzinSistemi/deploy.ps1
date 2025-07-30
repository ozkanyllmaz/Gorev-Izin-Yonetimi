# GorevIzinSistemi - Otomatik Build ve Deploy Scripti
# Bu script React uygulamasını build eder ve backend ile entegre eder

Write-Host "🚀 GorevIzinSistemi - Otomatik Deploy Başlatılıyor..." -ForegroundColor Green

# 1. React uygulamasının olduğu dizine git
Write-Host "📁 client-app dizinine geçiliyor..." -ForegroundColor Yellow
Set-Location -Path "client-app"

# 2. React uygulamasını build et
Write-Host "🔧 React uygulaması build ediliyor..." -ForegroundColor Yellow
npm run build

# Build başarılı mı kontrol et
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ React build başarılı!" -ForegroundColor Green
} else {
    Write-Host "❌ React build başarısız! Script durduruluyor." -ForegroundColor Red
    exit 1
}

# 3. wwwroot dizinini temizle (önceki dosyaları sil)
Write-Host "🧹 wwwroot dizini temizleniyor..." -ForegroundColor Yellow
if (Test-Path "..\wwwroot") {
    Remove-Item -Recurse -Force "..\wwwroot\*"
} else {
    New-Item -ItemType Directory -Path "..\wwwroot"
}

# 4. Build klasörünü wwwroot'a kopyala
Write-Host "📋 Build dosyaları wwwroot'a kopyalanıyor..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "build\*" "..\wwwroot\"

# 5. Ana dizine dön
Write-Host "🔙 Ana dizine dönülüyor..." -ForegroundColor Yellow
Set-Location -Path ".."

# 6. Backend + Frontend'i başlat
Write-Host "🎯 Backend + Frontend başlatılıyor..." -ForegroundColor Green
Write-Host "🌐 Tarayıcınızda http://localhost:5194 adresine gidin" -ForegroundColor Cyan
Write-Host "⏹️  Durdurmak için Ctrl+C tuşlarına basın" -ForegroundColor Cyan

dotnet run