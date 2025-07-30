using GorevIzinSistemi.Data;
using GorevIzinSistemi.Models.DTO;
using GorevIzinSistemi.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskStatus = GorevIzinSistemi.Models.Entities.TaskStatus;

namespace GorevIzinSistemi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : Controller
    {
        private readonly ApplicationDbContext dbContext;

        public DepartmentController(ApplicationDbContext dbContext) 
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await dbContext.Departments.ToListAsync();
            return Ok(departments);
        }

        
        [HttpGet("tasks")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetTasksByManagerDepartment(
            int pageNumber = 1,
            int pageSize = 10,
            string? filterStatus = null,
            string? filterUser = null,
            string? filterDepartment = null,
            string? filterStartDate = null,
            string? filterEndDate = null
            )
        {
            //gecersiz sayfa numarasi veya sayfa boyutu kontrolu
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 0) pageSize = 10;

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await dbContext.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user.Role != "Admin" && user.DepartmentId == null)
            {
                Console.WriteLine($"Kullanıcı veya departman bulunamadı: UserId={userId}");
                return BadRequest("Kullanıcı veya departman bilgisi bulunamadi");
            }

            //temel sorgu
            IQueryable<UserTask> query = dbContext.Tasks
                .Include(t => t.User)
                    .ThenInclude(u => u.Department);
            

            if (user.Role == "Admin")
            {
                // Admin tüm görevleri görür
                query = query; // tum gorevleri gorur
            }
            else if (user.Role == "Manager")
            {
                // Manager sadece kendi departmanındaki görevleri görür
                var departmentId = user.DepartmentId.Value;
                query = query.Where(t => t.User.DepartmentId == departmentId);
                
            }
            else if (user.Role == "User")
            {
                // Normal kullanıcı sadece kendi görevlerini görür
                query = query.Where(t => t.UserId  == user.Id);//***************************************
            }
            else
            {
                return BadRequest("Kullanıcı rolü tanımsız.");
            }

            if(!string.IsNullOrEmpty(filterStatus) && Enum.TryParse<TaskStatus>
                (filterStatus, true, out var status))
            {
                query = query.Where(t => t.Status == status);
            }
            if(!string.IsNullOrEmpty(filterUser))
            {
                query = query.Where(t => t.User.FullName == filterUser);
            }
            if (!string.IsNullOrEmpty(filterDepartment))
            {
                query = query.Where(t => t.User.Department != null && t.User.Department.Name == filterDepartment);
            }
            if(!string.IsNullOrEmpty(filterStartDate) && DateTime.TryParse(filterStartDate, out var startDate))
            {
                query = query.Where(t => t.EndDate >= startDate);
            }
            if(!string.IsNullOrEmpty(filterEndDate) && DateTime.TryParse(filterEndDate, out var endDate))
            {
                query = query.Where(t => t.StartDate <= endDate);
            }

            // toplam gorev sayisini al
            var totalTasks = await query.CountAsync();

            // sayfalandirma islemi
            var tasks = await query
                .OrderBy(t => t.Id)
                .Skip((pageNumber - 1) * pageSize) // kac tane sayfa atlanacak
                .Take(pageSize) // kac tane alinacak
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Status = t.Status.ToString(),
                    Description = t.Description,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    UserFullName = t.User.FullName,
                    DepartmentName = t.User.Department != null ? t.User.Department.Name : "-"
                })
                .ToListAsync();

            // Donen veri icin bir response modeli olustur
            var response = new
            {
                TotalTasks = totalTasks,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalTasks / (double)pageSize),
                Tasks = tasks
            };

            Console.WriteLine($"Dönen görev sayısı: {tasks.Count}");
            return Ok(response);

        }


        
        [HttpGet("leaves")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetLeavesByManagerDepartment(
            int pageNumber = 1,
            int pageSize = 10,
            string? filterLeaveType = null,
            string? filterStatus = null,
            string? filterDepartment = null,
            string? filterUser = null,
            string? filterStartDate = null,
            string? filterEndDate = null)
        {
            //gecersiz sayfa numarasi veya sayfa boyutu kontrolu
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 0) pageSize = 10;

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await dbContext.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.DepartmentId == null)
            {
                Console.WriteLine($"Kullanıcı veya departman bulunamadı: UserId={userId}");
                return BadRequest("Kullanıcı veya departman bilgisi bulunamadi");
            }

            //temel sorgu
            IQueryable<Leave> query = dbContext.Leaves
                .Include(l => l.User)
                    .ThenInclude(u => u.Department);

            if (user.Role == "Admin")
            {
                query = query;
            }
            else if (user.Role == "Manager")
            {
                // Manager sadece kendi departmanındaki kullanıcıları görür
                var departmentId = user.DepartmentId.Value;
                query = query.Where(l => l.User.DepartmentId == departmentId);
            }
            else if (user.Role == "User")
            {
                query = query.Where(l => l.UserId == user.Id);
            }
            else
            {
                return BadRequest("Kullanıcı rolü tanımsız.");
            }

            //Filtreleme
            if(!string.IsNullOrEmpty(filterLeaveType) && Enum.TryParse<LeaveType>
                (filterLeaveType, true, out var leaveType))
            {
                query = query.Where(l => l.leaveType == leaveType);
            }
            // Admin ise
            if(user.Role == "Admin" && !string.IsNullOrEmpty(filterStatus) && Enum.TryParse<StatusType>
                (filterStatus, true, out var status))
            {
                query = query.Where(l => l.statusType == status);
            }
            // Manager ise
            if (user.Role == "Manager" && !string.IsNullOrEmpty(filterStatus) && Enum.TryParse<ManagerResponseStatus>
                (filterStatus, true, out var managerResponse))
            {
                query = query.Where(l => l.managerResponseStatus == managerResponse);
            }
            if (!string.IsNullOrEmpty(filterDepartment))
            {
                query = query.Where(l => l.User.Department != null && l.User.Department.Name == filterDepartment);
            }
            if (!string.IsNullOrEmpty(filterUser))
            {
                query = query.Where(l => l.User.FullName == filterUser);
            }
            if (!string.IsNullOrEmpty(filterStartDate) && DateTime.TryParse(filterStartDate, out var startDate))
            {
                query = query.Where(l => l.EndDate >= startDate);
            }
            if(!string.IsNullOrEmpty(filterEndDate) && DateTime.TryParse(filterEndDate, out var endDate))
            {
                query = query.Where(l => l.StartDate <= endDate);
            }

            //toplam izin sayisi
            var totalLeaves = await query.CountAsync();

            // Siralama: Pending olanlar once, sonra StartDate'e gore en yeni ustte
            query = query
            .OrderBy(l => l.managerResponseStatus == ManagerResponseStatus.Pending ? 0 : 1) //Pending olanlar once
                .ThenByDescending(l => l.StartDate); // sonra tarih sirasina gore

            // Sayfalandirma islemi
            var leaves = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new LeaveDto
                {
                    Id = l.Id,
                    LeaveType = l.leaveType.ToString(),
                    Description = l.Description,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    StatusType = l.statusType.ToString(),
                    UserId = l.UserId,
                    UserFullName = l.User.FullName,
                    DepartmentName = l.User.Department != null ? l.User.Department.Name : "-",
                    managerResponseStatus = l.managerResponseStatus
                })
                .ToListAsync();

            // Donen veri icin response modeli olustur
            var response = new
            {
                TotalLeaves = totalLeaves,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalLeaves / (double)pageSize),
                Leaves = leaves
            };

            Console.WriteLine($"Dönen izin sayısı: {leaves.Count}");
            return Ok(response);

        }


        
        [HttpGet("users")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetUsersByManagerDepartment(
            int pageNumber = 1,
            int pageSize = 10,
            string? filterDepartment = null,
            string? filterUser = null,
            string? filterEmail = null)
        {
            //gecersiz sayfa numarasi veya sayfa boyutu kontrolu
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 0) pageSize = 10;

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            Console.WriteLine($"GetUsersByManagerDepartment - UserId: {userId}");
            var user = await dbContext.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if(user == null || user.DepartmentId == null)
            {
                Console.WriteLine($"Kullanıcı veya departman bulunamadı: UserId={userId}");
                return BadRequest("Kullanıcı ya da departman bulunamadi");
            }

            //temel sorgu
            IQueryable<User> query = dbContext.Users
                    .Include(u => u.Department);

            if (user.Role == "Admin")
            {
                query = query;
            }
            else if (user.Role == "Manager" && user.DepartmentId != null)
            {
                // Manager sadece kendi departmanındaki kullanıcıları görür
                var departmentId = user.DepartmentId.Value;
                query = query.Where(u => u.DepartmentId == departmentId);
            }
            else
            {
                return Unauthorized("Bu işlemi yapma yetkiniz yok.");
            }

            if(!string.IsNullOrEmpty(filterDepartment))
            {
                query = query.Where(u => u.Department != null && u.Department.Name == filterDepartment);
            }
            if(!string.IsNullOrEmpty(filterUser))
            {
                query = query.Where(u => u.FullName == filterUser);
            }
            if (!string.IsNullOrEmpty(filterEmail))
            {
                query = query.Where(u => u.Email == filterEmail);
            }

            // toplam kullanici sayisini al
            var totalUsers = await query.CountAsync();

            var users = await query
            .OrderBy(u => u.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
               u.Id,
               u.FullName,
               u.Email,
               u.Role,
              DepartmentName = u.Department != null ? u.Department.Name : "-"
            })
            .ToListAsync();

            // Dönen veri için bir response modeli oluştur
            var response = new
            {
                TotalUsers = totalUsers,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalUsers / (double)pageSize),
                Users = users
            };

            Console.WriteLine($"Dönen kullanıcı sayısı: {users.Count}");
            return Ok(response);

        }

    }
}
