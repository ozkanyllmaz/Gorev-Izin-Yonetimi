using GorevIzinSistemi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace GorevIzinSistemi.Data
{
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserTask> Tasks { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<Department> Departments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Department-Manager (1:1)
            modelBuilder.Entity<Department>()
                .HasOne(d => d.User) // Manager
                .WithMany() // Manager birden fazla departmana sahip değil
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Silinince hata olmamasi icin

            // User-Department (n:1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
