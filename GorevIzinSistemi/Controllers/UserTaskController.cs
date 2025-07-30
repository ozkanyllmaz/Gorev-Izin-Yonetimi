using GorevIzinSistemi.Data;
using GorevIzinSistemi.Models.DTO;
using GorevIzinSistemi.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskStatusEnum = GorevIzinSistemi.Models.Entities.TaskStatus;


namespace GorevIzinSistemi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // TaskController endpointlerine erisebilmek için kimlik dogrulasi yapilmasi gerekir.
    public class UserTaskController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public UserTaskController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("MyTasks")]
        public async Task<IActionResult> GetTasks()
        {

            var firstUser = await dbContext.Users.Include(u => u.Department).FirstOrDefaultAsync();
            Console.WriteLine("Department adı: " + firstUser?.Department?.Name); // null mı geliyor kontrol et

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = dbContext.Tasks
                .Include(t => t.User) // Task ile iliskili olan User nesnesini de sorguya dahil eder
                    .ThenInclude(u => u.Department)
                .Where(t => t.UserId == userId)
                .AsQueryable(); // LINQ sorgusunun devaminda dinamik olarak kosul ekleyebilmemi saglar

            //toplam gorev sayisini al
            var totalTasks = await query.CountAsync();

            var tasks = await query
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,    
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    //t.Status nullable ise
                    Status = t.Status.ToString(),
                    UserId = t.UserId,
                    UserFullName = t.User!.FullName, // t.User su an sana null olabilir gibi gozukuyor ama ben eminim null degil. Bu yuzden null uyarisi verme anlamina geliyor 't.User!.FullName'
                    DepartmentName = t.User.Department != null ? t.User.Department.Name : "-"
                })
                .ToListAsync();

           
            return Ok(tasks);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var task = await dbContext.Tasks
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound("Görev bulunamadı");
            }

            // Admin degilse ve login olan kullanici degilse gorevi goremez
            if(userRole == "Admin" && task.UserId != userId)
            {
                return Forbid("Bu gorevi gormeye yetkiniz yok"); //Forbid(): Kullani authenticated olmasina ragmen belirli bir kaynaga yetkisi (authorization) olmadigi durumlarda kullanılan bir HTTP 403 Forbidden cevabini dondormek icin kullanilir.
            }

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                Status = task.Status.ToString(),
                UserId = userId,
                UserFullName = task.User!.FullName
            };
            return Ok(taskDto);

        }


        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto taskCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //Bitis tarihi baslangic tarihinden daha once olamaz!!
            if (taskCreateDto.EndDate < taskCreateDto.StartDate)
            {
                return BadRequest(ModelState);
            }


            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var newTask = new UserTask
            {
                Title = taskCreateDto.Title,
                Description = taskCreateDto.Description,
                StartDate = taskCreateDto.StartDate,
                EndDate = taskCreateDto.EndDate,
                Status = taskCreateDto.Status,
                UserId = userId
            };

            dbContext.Tasks.Add(newTask);
            await dbContext.SaveChangesAsync();

            //olusturdugum gorevi geri dondurmak[REST standartlarina uygunluk icin 201 created donmesi icin]
            // geri dondurmesem 200 ok donecek ama rest standartina uygun degil
            var createdTask = await dbContext.Tasks
                .Include(t => t.User) //Task ile iliskili User nesnesi birlikte cekirlir(eager loading)
                    .ThenInclude(u => u.Department)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(t => t.Id == newTask.Id); // newTask.Id ile eslesen ilk degeri bulur,getirir

            //dto araciligiyla donduruyoruz
            var taskDto = new TaskDto
            {
                Id = createdTask!.Id,
                Title = createdTask.Title,
                Description = createdTask.Description,
                StartDate = createdTask.StartDate,
                EndDate = createdTask.EndDate,
                Status = createdTask.Status.ToString(),
                UserId = createdTask.UserId,
                UserFullName = createdTask.User!.FullName
            };
            return CreatedAtAction(nameof(GetTask), new
            {
                id = newTask.Id,
            }, taskDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateDto taskUpdateDto)
        {
            if (!ModelState.IsValid) 
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var task = await dbContext.Tasks
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) 
            {
                return NotFound("Görev bulunamadı"); 
            }
            
            if(userRole != "Admin" && task.UserId != userId)
            {
                return Forbid("Görevi güncellemeye yetkiniz yok");
            }
             
            if (taskUpdateDto.EndDate < taskUpdateDto.StartDate)
            {
                return BadRequest("Gorev bitis tarihi baslangic tarihinden once olamaz");
            }

            if (!Enum.TryParse<TaskStatusEnum>(taskUpdateDto.Status, ignoreCase: true, out var parsedStatus))
            {
                return BadRequest("Geçersiz görev durumu. Geçerli değerler: Pending, InProgress, Completed, Cancelled.");
            }

            task.Title = taskUpdateDto.Title;
            task.Description = taskUpdateDto.Description;   
            task.StartDate = taskUpdateDto.StartDate;
            task.EndDate = taskUpdateDto.EndDate;
            task.Status = parsedStatus;

            await dbContext.SaveChangesAsync();
            return NoContent();

        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var task = await dbContext.Tasks
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) 
            {
                return NotFound("Gorev bulunamadı");
            }

            if(userRole != "Admin" && task.UserId != userId)
            {
                return Forbid("Gorevi silmeye yetkiniz yok");
            }

            dbContext.Tasks.Remove(task);
            await dbContext.SaveChangesAsync();

            return NoContent();
            
        }


        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers(int pageNumber = 1, int pageSize = 10)
        {
            //gecersiz sayfa numarasi veya sayfa boyutu kontrolu
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 0) pageSize = 10;

            // toplam kullanici sayisini alalim
            var totalUser = await dbContext.Users.CountAsync();

            var users = await dbContext.Users
                .OrderBy(u => u.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            //Response modeli olustur
            var response = new
            {
                TotalUser = totalUser,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalUser / (double)pageSize),
                Users = users
            };

            Console.WriteLine($"Dönen kullanıcı sayısı: {users.Count}");
            return Ok(response);
        }


        

    }
}
