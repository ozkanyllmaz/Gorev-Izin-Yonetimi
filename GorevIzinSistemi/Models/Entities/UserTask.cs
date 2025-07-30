namespace GorevIzinSistemi.Models.Entities
{
    public enum TaskStatus
    {
        Pending, //beklemede (daha baslatilmadi)
        InProgress,
        Completed,
        Cancelled
    }
    public class UserTask
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TaskStatus Status { get; set; }
        public int UserId   { get; set; }
        public User? User { get; set; }
    }
}
