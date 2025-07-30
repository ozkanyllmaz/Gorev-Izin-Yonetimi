using GorevIzinSistemi.Models.Entities;

namespace GorevIzinSistemi.Models.DTO
{
    public class LeaveDto
    {
        public int Id { get; set; }
        public string LeaveType { get; set; } = "Pending";
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StatusType { get; set; } = "Pending";
        public int UserId { get; set; }
        public string? UserFullName { get; set; }
        public string? DepartmentName { get; set; }
        public ManagerResponseStatus managerResponseStatus {  get; set; }
    }
}
