namespace GorevIzinSistemi.Models.Entities
{
    public class User
    {
        public int Id { get; set; }    
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string Role { get; set; } // 'Admin', 'User' ya da 'Manager'

        //departman iliskisi
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }

        public bool EmailConfirmed { get; set; } = false; //yeni alan ekledim
        public string? EmailConfirmationToken { get; set; } // yeni alan ekledim.Migration ile db guncellicem
        public DateTime? TokenExpireDate { get; set; } // token suresi

    }
}
