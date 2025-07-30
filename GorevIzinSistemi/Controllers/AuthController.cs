using GorevIzinSistemi.Data;
using GorevIzinSistemi.Models.DTO;
using GorevIzinSistemi.Models.Entities;
using GorevIzinSistemi.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GorevIzinSistemi.Controllers
{
    // localhost:xxxx/api/Auth
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IEmailSender emailSender;

        public AuthController(ApplicationDbContext dbContext, IEmailSender emailSender)
        {
            this.dbContext = dbContext;
            this.emailSender = emailSender;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if(registerDto.DepartmentId == 4)
            {
                return BadRequest("Bu departmana kayıt yapılamaz");
            }

            //Email kontrolu
            var existingUser = dbContext.Users.FirstOrDefault(u => u.Email == registerDto.Email);
            if(existingUser != null)
            {
                return BadRequest("This Mail Already Exist in System");
            }

            // sifreyi hashleme
            var passwordHash = HashPassword(registerDto.Password);

            //email zaman token olusturuyorum
            var token = Guid.NewGuid().ToString();

            // yeni kullanici olusturma
            var newUser = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = passwordHash, // yeni kullaniciya hashlenmis sifre atadim
                Role = "User",
                EmailConfirmationToken = token,
                TokenExpireDate = DateTime.UtcNow.AddHours(24),
                EmailConfirmed = false,
                DepartmentId = registerDto.DepartmentId
            };

            //veritabanina kaydetme
            dbContext.Users.Add(newUser);
            dbContext.SaveChanges();

            var confirmationLink = $"http://localhost:5194/api/Auth/email-confirm?email={newUser.Email}&token={token}";
            var message = $"Merhaba {newUser.FullName}, e-posta adresinizi doğrulamak için <a href='{confirmationLink}'> buraya tıklayın </a>." +
                $"Bu bağlantı 24 saat geçerlidir.";

            try
            {
                await emailSender.SendEmailAsync(newUser.Email, "E-posta Doğrulama", message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("E-posta gönderme hatası: " + ex.Message);
                return StatusCode(500, "Kullanıcı kaydedildi fakat e-posta gönderilmedi");
            }

            return Ok("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");
        }



        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            Console.WriteLine(HashPassword("123456"));
            // Model validation
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //mail check
            var user = dbContext.Users.FirstOrDefault(u => u.Email == loginDto.Email);
            if (user is null)
            {
                return Unauthorized(new { message = "Kullanıcı bulunamadı" });
            }

            if (!user.EmailConfirmed)
            {
                return BadRequest(new { message = "Lütfen önce e-posta adresinizi doğrulayın." });
            }

            //password check
            var passwordHash = HashPassword(loginDto.Password);
            
            
            if (user.PasswordHash != passwordHash) 
            {
                return BadRequest(new { message = "Email veya Şifre Hatalı" });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            if (user.DepartmentId.HasValue) 
            { 
                claims.Add(new Claim("DepartmentId", user.DepartmentId.Value.ToString()));
            }

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);

            return Ok(new
            {
                message = "Giriş başarılı",
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role
                }
            });


        }



        [HttpPost("Logout")]
        [Authorize] // sadece giris yapan kullanicilar cikis yapabilemeli
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new
            {
                message = "Çıkış yapıldı."
            });
        }


        [HttpGet("Profile")]
        [Authorize] // sadece login olan kullanicilar profil bilgilerini görebilir
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = dbContext.Users.Find(int.Parse(userId));

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            });
        }


        [HttpGet("admin-only")]
        [Authorize(Roles ="Admin")] // sadece Admin rolü erişebilir
        public IActionResult AdminOnly()
        {
            return Ok(new
            {
                message = "Bu endpoint sadece Admin kullanıcıları görebilir!"
            });
        }


        [HttpGet("user-only")]
        [Authorize(Roles = "User")] // sadece User rolü erişebilir
        public IActionResult UserOnly()
        {
            return Ok(new
            {
                message = "Bu endpoint sadece User kullanıcıları görebilir"
            });
        }


        [HttpGet("admin-or-user")]
        [Authorize(Roles = "Admin,User")] // Admin veya User rolü erişebilir
        public IActionResult AdminOrUser()
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return Ok(new
            {
                message = $"Merhaba {userName}! Sen {userRole} rolündesin.",
            });
        }


        [HttpGet("email-confirm")]
        public IActionResult ConfirmEmail([FromQuery] string email, [FromQuery] string token)
        {
            var user = dbContext.Users.FirstOrDefault(u => u.Email == email && u.EmailConfirmationToken == token);
            if (user == null) 
            {
                return BadRequest("Geçersiz token veya kullanıcı");
            }
            user.EmailConfirmed = true;
            user.EmailConfirmationToken = null; //guvenlik acisindan tokeni 1 kez kullanilabilir kiliyoruz.

            dbContext.SaveChanges();

            return Ok("E-posta başarıyla doğrulandı.");
        }


        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create()) 
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        

    }
}
