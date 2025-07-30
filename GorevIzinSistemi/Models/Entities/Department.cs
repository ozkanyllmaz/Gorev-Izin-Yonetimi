namespace GorevIzinSistemi.Models.Entities
{
    public class Department
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        //departmanın calısanları
        public ICollection<User>? Users { get; set; }
    }
}
