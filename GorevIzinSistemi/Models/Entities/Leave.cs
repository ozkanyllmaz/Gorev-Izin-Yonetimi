namespace GorevIzinSistemi.Models.Entities
{
    public enum LeaveType
    {
        Annual,
        Sick,
        Maternity,
        Unpaid,
        Bereavement,
        Study
    }
    public enum StatusType
    {
        Pending,
        Approved,
        Rejected
    }

    public enum ManagerResponseStatus
    {
        Pending,
        Approved,
        Rejected
    }
    public class Leave
    {
        public int Id { get; set; }
        public LeaveType leaveType { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public StatusType statusType { get; set; }
        public int UserId  { get; set; }    
        public User? User { get; set; }

        public ManagerResponseStatus managerResponseStatus { get; set; } // Pending, Approved, Rejected

    }
}
