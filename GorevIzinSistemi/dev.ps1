# GorevIzinSistemi - Geliştirme Modu Scripti
# Bu script React'i development modunda çalıştırır

Write-Host "🚀 GorevIzinSistemi - Geliştirme Modu Başlatılıyor..." -ForegroundColor Green

# İki terminal penceresi açmak için Start-Process kullan
Write-Host "🖥️  Backend başlatılıyor..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

# 2 saniye bekle
Start-Sleep -Seconds 2

Write-Host "⚛️  React development server başlatılıyor..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client-app; npm start"

Write-Host "✅ Her iki server da başlatıldı!" -ForegroundColor Green
Write-Host "🌐 Backend: http://localhost:5194" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "💡 Geliştirme sırasında React değişikliklerini http://localhost:3000'de görün" -ForegroundColor Yellow