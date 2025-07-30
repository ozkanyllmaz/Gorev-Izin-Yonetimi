using GorevIzinSistemi.Data;
using GorevIzinSistemi.Models.DTO;
using GorevIzinSistemi.Models.Entities;
using GorevIzinSistemi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GorevIzinSistemi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] //izin alabilmek için kimlik dogrulasi gerekir
    public class LeaveController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IEmailSender emailSender;

        public LeaveController(ApplicationDbContext dbContext, IEmailSender emailSender) 
        {
            this.dbContext = dbContext;
            this.emailSender = emailSender; 
        }

        [HttpGet("MyLeaves")]
        public async Task<IActionResult> GetLeaves()
        {

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = dbContext.Leaves
                .Include(l => l.User) //Leave ile iliskili olan User nesnesini de sorguya dahil eder.
                    .ThenInclude(u => u.Department)
                        .AsQueryable(); //LINQ sorgusunun devaminda dinamik olarak kosul ekleyebilmemizi saglar.

            if(userRole != "Admin") // giris yapan Admin degilse user kendi izinlerini gorsun
            {
                query = query.Where(l => l.UserId == userId);
            } else
            {
                query = query.Where(l => l.managerResponseStatus != ManagerResponseStatus.Pending);
            }


                var leaves = await query
                    .Select(l => new LeaveDto
                    {
                        Id = l.Id,
                        LeaveType = l.leaveType.ToString(),
                        Description = l.Description,
                        StartDate = l.StartDate,
                        EndDate = l.EndDate,
                        StatusType = l.statusType.ToString(),
                        UserId = l.UserId,
                        UserFullName = l.User!.FullName,
                        DepartmentName = l.User.Department != null ? l.User.Department.Name : "-"
                    })
                    .ToListAsync();
            
            return Ok(leaves);

        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeave(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var leave = await dbContext.Leaves
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if(leave == null)
            {
                return NotFound("İzin bulunamadı");
            }

            //Admin degilse ve login olan kullanici degilse izni goremez
            if(userRole != "Admin" && leave.UserId != userId)
            {
                return Forbid("Bu izni göremeye yetkiniz yok");
            }

            var leaveDto = new LeaveDto
            {
                Id = leave.Id,
                LeaveType = leave.leaveType.ToString(),
                Description = leave.Description,
                StartDate = leave.StartDate,
                EndDate = leave.EndDate,
                StatusType = leave.statusType.ToString(),
                UserId = userId,
                UserFullName = leave.User!.FullName
            };
            return Ok(leaveDto); 

        }


        [HttpPost]
        public async Task<IActionResult> CreateLeave([FromBody] LeaveCreateDto leaveCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if(leaveCreateDto.EndDate < leaveCreateDto.StartDate)
            {
                return BadRequest("İzin bitiş tarihi başlangıc tarihinden önce olamaz");
            }

            if(leaveCreateDto.StartDate < DateTime.Today)
            {
                return BadRequest(new { message = "Başlangıç tarihi bugünden önce olamaz." });
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var newLeave = new Leave
            {
                leaveType = leaveCreateDto.leaveType,
                Description = leaveCreateDto?.Description,
                StartDate = leaveCreateDto.StartDate,
                EndDate = leaveCreateDto.EndDate,
                statusType = StatusType.Pending, // default olarak burada set ediyorum.
                UserId = userId,
                managerResponseStatus = ManagerResponseStatus.Pending
            };

            dbContext.Add(newLeave);
            await dbContext.SaveChangesAsync();

            // izni olusturdum fakat REST standartlarina uygun olmasi için geri dondurmam gerek(201 created)
            var createdLeave = await dbContext.Leaves
                .Include(l => l.User)
                    .ThenInclude(u => u.Department)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(l => l.Id == newLeave.Id);

            //DTO aracılıgıyla geri donduruyoruz
            var leaveDto = new LeaveDto
            {
                Id = createdLeave.Id,
                LeaveType = createdLeave.leaveType.ToString(),
                Description = createdLeave.Description,
                StartDate = createdLeave.StartDate,
                EndDate = createdLeave.EndDate,
                StatusType = createdLeave.statusType.ToString(),
                UserId = createdLeave.UserId,
                UserFullName = createdLeave.User!.FullName,
                managerResponseStatus = createdLeave.managerResponseStatus
            };

            // departman yoneticisine gidecek mail
            var leaveTypeTr = TranslateLeaveType(createdLeave.leaveType.ToString());
            await emailSender.SendEmailAsync(
                createdLeave.User.Department.User.Email,
                "Yeni İzin Talebi",
                $"Merhaba {createdLeave.User.Department.User.FullName},<br><br>{createdLeave.User.Department.Name} departmanınıza bağlı " +
                 $"{createdLeave.User.FullName}, <strong>{leaveTypeTr}</strong> izni için talep açtı. Lütfen kısa süre içinde değerlendiriniz." +
                  $"<br><br>İzin açıklaması:<br><br><b><i>{createdLeave.Description}</i></b>" +
                   $"<br><br>İyi Çalışmalar."
                );

            return CreatedAtAction(nameof(GetLeave), new { id = newLeave.Id }, leaveDto);

        }


        [HttpPost("Manager")]
        public async Task<IActionResult> ManagerCreateLeave([FromBody] LeaveCreateDto leaveCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (leaveCreateDto.EndDate < leaveCreateDto.StartDate)
            {
                return BadRequest("İzin bitiş tarihi başlangıc tarihinden önce olamaz");
            }

            if (leaveCreateDto.StartDate < DateTime.Today)
            {
                return BadRequest(new { message = "Başlangıç tarihi bugünden önce olamaz." });
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var newLeave = new Leave
            {
                leaveType = leaveCreateDto.leaveType,
                Description = leaveCreateDto?.Description,
                StartDate = leaveCreateDto.StartDate,
                EndDate = leaveCreateDto.EndDate,
                statusType = StatusType.Pending, // default olarak burada set ediyorum.
                UserId = userId,
                managerResponseStatus = ManagerResponseStatus.Approved
            };

            dbContext.Add(newLeave);
            await dbContext.SaveChangesAsync();

            // izni olusturdum fakat REST standartlarina uygun olmasi için geri dondurmam gerek(201 created)
            var createdLeave = await dbContext.Leaves
                .Include(l => l.User)
                    .ThenInclude(u => u.Department)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(l => l.Id == newLeave.Id);

            //DTO aracılıgıyla geri donduruyoruz
            var leaveDto = new LeaveDto
            {
                Id = createdLeave.Id,
                LeaveType = createdLeave.leaveType.ToString(),
                Description = createdLeave.Description,
                StartDate = createdLeave.StartDate,
                EndDate = createdLeave.EndDate,
                StatusType = createdLeave.statusType.ToString(),
                UserId = createdLeave.UserId,
                UserFullName = createdLeave.User!.FullName,
                managerResponseStatus = createdLeave.managerResponseStatus
            };

            // admine gidecek mail
            var leaveTypeTr = TranslateLeaveType(createdLeave.leaveType.ToString());
            await emailSender.SendEmailAsync(
                "gorevizinyonetimi.yonetici@gmail.com",
                "Yeni İzin Talebi",
                $"Merhaba Sayın Yönetici,<br><br>{createdLeave.User.Department.Name} departmanı yöneticisi " +
                 $"{createdLeave.User.FullName}, <strong>{leaveTypeTr}</strong> izni için talep açtı. Lütfen kısa süre içinde değerlendiriniz." +
                  $"<br><br>İzin açıklaması:<br><br><b><i>{createdLeave.Description}</i></b>" +
                   $"<br><br>İyi Çalışmalar."
                );

            return CreatedAtAction(nameof(GetLeave), new { id = newLeave.Id }, leaveDto);

        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeave(int id, [FromBody] LeaveUpdateDto leaveUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var leave = await dbContext.Leaves
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leave == null) 
            {
                return BadRequest("İzin bulunamadı");
            }

            if (userRole != "Admin" && leave.UserId != userId)
            {
                return BadRequest("İzin güncellemeye yetkiniz yok");
            }

            if (leave.EndDate < leave.StartDate)
            {
                return BadRequest("İzin bitis tarihi baslangic tarihinden once olamaz");
            }

            if (leave.managerResponseStatus != ManagerResponseStatus.Pending || leave.statusType != StatusType.Pending)
            {
                return BadRequest(new { message = "Yönetici veya admin izin talebine yanıt verdiği için güncelleme yapılamaz" });
            }

            leave.leaveType = leaveUpdateDto.leaveType;
            leave.Description = leaveUpdateDto.Description;  
            leave.StartDate = leaveUpdateDto.StartDate;
            leave.EndDate = leaveUpdateDto.EndDate;

            await dbContext.SaveChangesAsync();
            return NoContent(); 



        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var leave = await dbContext.Leaves
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leave == null)
            {
                return NotFound("İzin bulunamadi");
            }

            if(userRole != "Admin" && leave.UserId != userId)
            {
                return Forbid("İzini silmeye yetkiniz yok");
            }

            dbContext.Leaves.Remove(leave);
            await dbContext.SaveChangesAsync();

            return NoContent(); 

        }


        [HttpPut("manager-approved/{leaveId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> ManagerApprove(int leaveId)
        {
            var leave = await dbContext.Leaves
                .Include(l => l.User)
                    .ThenInclude(u => u.Department)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(l => l.Id == leaveId);

            if (leave == null)
            {
                return NotFound("İzin bulunamadi");
            }

            leave.managerResponseStatus = ManagerResponseStatus.Approved;
            await dbContext.SaveChangesAsync();

            // mail gonderme
            var managerName = leave.User.Department?.User?.FullName ?? "Departman Yöneticisi";
            var leaveTypeTr = TranslateLeaveType(leave.leaveType.ToString());
            // izin alan calisana giden mail
            await emailSender.SendEmailAsync(
                leave.User.Email,
                "İzin Talebiniz Departman Yöneticiniz Tarafından Onaylandı",
                $"Merhaba {leave.User.FullName}, <br><br><strong>{leaveTypeTr}</strong> izniniz " +
                $"departman yöneticiniz {managerName} tarafından onaylanmıştır. " +
                    $"En kısa sürede Yönetim birimi tarafından izniniz değerlendirilecektir.<br><br>İyi Günler"
                );
            // admin e giden mail
            await emailSender.SendEmailAsync(
                   "gorevizinyonetimi.yonetici@gmail.com",
                   $"{leave.User.Department.Name} Departmanı Yöneticisi Bir İzni Onayladı",
                   $"{leave.User.Department.Name} Departmanı yöneticisi sayın {managerName} " +
                    $"{leave.User.FullName} isimli çalışanın <strong>{leaveTypeTr}</strong> iznini onayladı. İzin Durumunu lütfen değerlendirin.<br><br>İyi Çalışamalar." +
                     $"<br><br>İzin açıklaması:<br><br><b><i>{leave.Description}</i></b>"
                );
            return Ok(new { message = "İzin Manager tarafından onaylandı" });
        }

        [HttpPut("manager-rejected/{leaveId}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> ManagerReject(int leaveId)
        {
            var leave = await dbContext.Leaves
                .Include(l => l.User)
                    .ThenInclude(u => u.Department)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(l => l.Id == leaveId);

            if (leave == null)
            {
                return NotFound("İzin bulunamadi");
            }

            if (leave.managerResponseStatus == ManagerResponseStatus.Pending && leave.statusType == StatusType.Pending)
            {
                leave.managerResponseStatus = ManagerResponseStatus.Rejected;
            }

            leave.managerResponseStatus = ManagerResponseStatus.Rejected;
            await dbContext.SaveChangesAsync();

            // izin alan calisana giden mail
            var managerName = leave.User.Department?.User?.FullName ?? "Departman Yöneticisi";
            var leaveTypeTr = TranslateLeaveType(leave.leaveType.ToString());
            await emailSender.SendEmailAsync(
                leave.User.Email,
                "İzin Talebiniz Departman Yöneticiniz Tarafından Reddedildi",
                $"Merhaba {leave.User.FullName}, <br><br><strong>{leaveTypeTr}</strong> izniniz " +
                $"departman yöneticiniz {managerName} tarafından reddedilmiştir. " +
                    $"En kısa sürede Yönetim birimi tarafından izniniz değerlendirilecektir.<br><br>İyi Günler"
                );

            // admine giden mail
            await emailSender.SendEmailAsync(
                "gorevizinyonetimi.yonetici@gmail.com",
                $"{leave.User.Department.Name} Departmanı Yöneticisi Bir İzni Reddetti",
                $"{leave.User.Department.Name} Departmanı yöneticisi sayın {managerName} " +
                 $"{leave.User.FullName} isimli çalışanın <strong>{leaveTypeTr}</strong> iznini reddetti. İzin Durumunu lütfen değerlendirin.<br><br>İyi Çalışamalar." +
                  $"<br><br>İzin açıklaması:<br><br><b><i>{leave.Description}</i></b>"
                );
            return Ok(new { message = "İzinler Manager tarafında reddedildi" });

        }

        //Admin icin izinleri onaylama
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveLeave(int id)
        {
            var leave = await dbContext.Leaves
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leave == null)
            {
                return NotFound("İzin bulunamadi");
            }

            leave.statusType = StatusType.Approved;
            await dbContext.SaveChangesAsync();

            //mail gonderme
            var leaveTypeTR = TranslateLeaveType(leave.leaveType.ToString());
            await emailSender.SendEmailAsync(
                    leave.User.Email,
                    "İzin Talebiniz Onaylandı",
                    $"Merhaba { leave.User.FullName}, <br><br><strong>{leaveTypeTR}</strong> izniniz onaylanmıştır.<br><br>Teşekkürler.");

            return Ok(new { message = "İzin onaylandı" });

        }



        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectLeave(int id)
        {
            var leave = await dbContext.Leaves
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leave == null)
            {
                return NotFound("İzin bulunamadi");
            }

            leave.statusType = StatusType.Rejected;
            await dbContext.SaveChangesAsync();

            //mail gonderme
            var leaveTypeTR = TranslateLeaveType(leave.leaveType.ToString());

            await emailSender.SendEmailAsync(
                    leave.User.Email,
                    "İzniniz Reddedildi",
                    $"Merhaba {leave.User.FullName},<br><br><strong>{leaveTypeTR}</strong> izniniz reddedilmiştir.<br><br>İyi günler."
                );

            return Ok(new { message = "İzin reddedildi" });
        }

        

        private string TranslateLeaveType(string leaveType)
        {
            return leaveType switch
            {
                "Annual" => "Yıllık",
                "Sick" => "Hastalık",
                "Maternity" => "Doğum",
                "Unpaid" => "Ücretsiz",
                "Bereavement" => "Yas",
                "Study" => "Çalışma",
                _ => leaveType
            };
        }

        
    }
}
