# Görev ve İzin Takip Sistemi

Bu proje, şirket içi personel izinlerinin ve görevlerinin yönetilmesini sağlayan (full-stack) bir web uygulamasıdır. ASP.NET Core(.NET 8), Entity Framework Core ve React kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- 👤 **Kullanıcı rolleri** (Yönetici / Departman Yöneticisi / Çalışan)
- 📅 **Görev atama ve takip**
- 📝 **İzin talebi oluşturma ve yönetimi**
- 📊 **Excel’e aktarım özelliği** (xlsx, file-saver)
- 🛡️ **Cookie tabanlı kimlik doğrulama**
- 📧 **Mail gönderme sistemi** (Gmail SMTP üzerinden)
- 🌐 **Swagger desteği** (API dokümantasyonu)
- 🎨 **Tailwind CSS ile modern kullanıcı arayüzü**

## 🧱 Teknoloji Yığını

| Katman    | Teknoloji / Kütüphane                        |
|-----------|---------------------------------------------|
| Backend   | ASP.NET Core 8, EF Core, SQL Server         |
| Frontend  | React, React Router DOM, Tailwind CSS       |
| Styling   | Tailwind CSS, PostCSS                        |
| Dev Tools | PowerShell script (develop.ps1), Swagger    |
| Diğer     | Web Vitals, Xlsx, File Saver, Cookie Auth  |


## ⚙️ Kurulum

### 📌 Gereksinimler

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download)
- [Node.js](https://nodejs.org/) (v16+)
- npm (Node Package Manager)
- SQL Server Express + Management Studio
- Visual Studio 2022 (veya VS Code)


## Proje Klasörü Yapısı

GorevIzinSistemi/

├── client-app/ # React uygulaması

├── Controllers/ # ASP.NET Web API controller'ları

├── Data/ # DbContext ve veritabanı ilişkileri

├── wwwroot/ # React build çıktısı

├── develop.ps1 # Otomatik build & deploy scripti

├── Program.cs # Giriş noktası

├── appsettings.json # Ayarlar (veritabanı, email)

## 💻 Kurulum ve Çalıştırma Adımları

### Kurulum Adımları

### 1. Depoyu Klonlayın
 ```bash
   git clone https://github.com/kullanici-adi/GorevIzinSistemi.git
   cd GorevIzinSistemi
 ```

### 2. Backend Bağımlılıkları 
Proje kök dizininde aşağıdaki komutu çalıştırın:
```bash
    dotnet restore
```


### 2. React Kurulumu ve Derlenmesi

```bash
# Root dizine gel
cd GorevIzinSistemi


# Gerekli kütüphaneleri yükle
cd client-app
npm install react-router-dom
npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
npm install web-vitals
npm install xlsx file-saver
```


### 3. Tailwind CSS Yapılandırması
```bash
npx tailwindcss init -p
```

### 4. Veritabanı Ayarları (`appsettings.json`)

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=[YOUR_SERVER_NAME]\\SQLEXPRESS;Database=[YOUR_DATABASE_NAME];Trusted_Connection=True;TrustServerCertificate=True;"
}
```
> 🛠️ Not:
> - `Server=` kısmını kendi bilgisayarınıza göre ayarlayın.
> - `Database=` kısmı, veritabanı adınız ile uyumlu olmalı.

### 5. 📬 Mail Gönderme Ayarları (`appsettings.json`)

```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "gorevizinyonetimi@gmail.com",
  "SenderPassword": "UYGULAMA_SIFRENIZ"
}
```

> 🔐 **Not:**  
> `SenderPassword` alanı, Google hesabı için oluşturulan **uygulama şifresi** ile doldurulmalıdır.  
> Gmail hesabınızda **2 Adımlı Doğrulama** etkin olmalıdır.  
> Ardından [Google Uygulama Şifreleri](https://myaccount.google.com/apppasswords) sayfasına giderek:
> - Uygulama: **Posta**  
> - Cihaz: **Windows Bilgisayar**  
> gibi bir seçim yaparak yeni bir uygulama şifresi oluşturabilirsiniz.
>
> Bu yöntem sayesinde, asıl Gmail şifrenizi paylaşmadan güvenli bir şekilde **SMTP** üzerinden mail gönderebilirsiniz.
> Gönderici mailini istediğiniz gibi değiştirebilirsiniz.


## 6. 🧩 Migration ve Veritabanı Güncellemeleri

Veritabanını güncellemelisiniz :

```csharp
# Veritabanını güncelle
dotnet ef database update
```

> **Not:** Proje, veritabanı şemasını tanımlayan migration dosyalarını içermektedir ve bu dosyalar Migrations/ klasöründe yer almaktadır. Bu nedenle dotnet ef migrations add komutunu çalıştırmanıza gerek yoktur. Yukarıdaki komut, veritabanını mevcut migration'lara uygun şekilde oluşturacak ve seed.sql dosyasındaki başlangıç verilerini otomatik olarak uygulayacaktır. Seed.sql dosyasındaki verileri siz tekrar güncelleyebilirsiniz. Tüm kullanıcıların şifreleri '123456' dır.

> Not: `Microsoft.EntityFrameworkCore.Tools` paketi proje dosyasına eklenmiş olmalıdır.

### 7. Otomatik Build & Deploy

```bash
# PowerShell scripti çalıştırılır
.\develop.ps1
```

Yukarıdaki PowerShell script’i şu işlemleri otomatik olarak gerçekleştirir:

- React uygulamasını build eder.
- Oluşan build çıktısını `wwwroot` klasörüne kopyalar.
- ASP.NET Core backend uygulamasını başlatır.



## 🛠️ EF Core & ApplicationDbContext Yapılandırması

`ApplicationDbContext.cs` sınıfı, veritabanı ile olan etkileşimleri yöneten temel sınıftır. EF Core kullanılarak aşağıdaki yapılandırmalar gerçekleştirilmiştir:

---

### 📁 Tanımlı Varlıklar (`DbSet`)

```csharp
public DbSet<User> Users { get; set; }
public DbSet<UserTask> Tasks { get; set; }
public DbSet<Leave> Leaves { get; set; }
public DbSet<Department> Departments { get; set; }
```

- Users: Sistemde oturum açan tüm kullanıcılar.

- UserTask: Çalışanlara atanan görevler.

- Leave: Kullanıcıların izin talepleri.

- Department: Organizasyonun bölümleri (müdür ve çalışan ilişkileri içerir).

## 🔗 Varlıklar Arası İlişkiler (Entity Relationships)

### 1️⃣ Departman — Müdür (1:1 İlişki)

Her departmanın bir müdürü vardır. Ancak bir kullanıcı yalnızca tek bir departmana müdür olabilir.

```csharp
modelBuilder.Entity<Department>()
    .HasOne(d => d.User)           // Müdür
    .WithMany()                    // Müdür başka departmana atanamaz
    .HasForeignKey(d => d.UserId)
    .OnDelete(DeleteBehavior.Restrict); // Silinince hata oluşmasın
```

## 2️⃣ Kullanıcı — Departman (N:1 İlişki)

Bir kullanıcı yalnızca bir departmanda çalışabilir, ancak bir departmanda birçok çalışan olabilir.

```csharp
modelBuilder.Entity<User>()
    .HasOne(u => u.Department)
    .WithMany(d => d.Users)
    .HasForeignKey(u => u.DepartmentId)
    .OnDelete(DeleteBehavior.Restrict); // Silme sırasında kullanıcılar etkilenmesin
```

> 🔐 `DeleteBehavior.Restrict:` Departman veya kullanıcı silinirken ilişkili kayıtların da otomatik silinmesini engeller. Bu, veri bütünlüğünü korumak için tercih edilir.





## 📜 Swagger UI
Proje çalışırken http://localhost:5194/swagger adresinden API endpoint’lerine ulaşabilirsiniz.


## 📷 Uygulama Ekran Resimleri

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2d7ea6d8-f684-489f-919d-c1d5ffcd50d3" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/9d93b384-e3ef-4e0c-bb98-2f629745347e" width="500" /></td>
  </tr>
</table>

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/e8d36648-540a-4e02-8ddd-63ced3f1d957" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/93ea5cac-1c6c-43ac-aa2e-7b83358da524" width="500" /></td>
  </tr>
</table>

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/844b167f-cc85-4121-946b-f0fa1114dc05" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/f90550d4-f548-49dd-bd72-684718a9d06d" width="500" /></td>
  </tr>
</table>


<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/16d6d951-bfe0-480b-8a04-1461750ec8d4" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/5e0491ed-4b45-40c2-b86d-c4ec39e02efe" width="500" /></td>
  </tr>
</table>



<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/bd316b30-2ef3-4ead-9f3e-8e905b77a1f4" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/d182fc69-b985-41c7-a9f5-700582725dd5" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/66773c96-496d-416e-b75f-f016091d9b81"  width="500" /></td>
  </tr>
</table>


<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/1188e738-6ebc-451c-84cc-44e98622158a" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/3296f163-18db-40f0-963f-eb7d3d77b4e8" width="500" /></td>
    <td><img src="https://github.com/user-attachments/assets/36e369d5-c56e-4278-aec5-3e5daabec57f"  width="500" /></td>
  </tr>
</table>







## 📬 İletişim
Herhangi bir sorunda ya da katkı sağlamak için:

📧 [gorevizinyonetimi@gmail.com](mailto:gorevizinyonetimi@gmail.com)




