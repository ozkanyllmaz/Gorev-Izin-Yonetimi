namespace GorevIzinSistemi.Models.DTO
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Pending";
        public int UserId { get; set; }
        public string? UserFullName { get; set; }
        public string? DepartmentName { get; set; }

    }
}
