using System.ComponentModel.DataAnnotations;

namespace GorevIzinSistemi.Models.DTO
{
    public class RegisterDto
    {
        [Required(ErrorMessage ="Ad Soyad alanı zorunludur")]
        [StringLength(100, MinimumLength = 5, ErrorMessage ="Ad Soyad 5-100 karakter arasında olmalıdır")]
        public required string FullName { get; set; }

        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        [StringLength(100,ErrorMessage = "Email en fazla 100 karakter olabilir")]
        public required string Email { get; set; }

        [Required(ErrorMessage ="Şifre alanı zorunludur")]
        [MinLength(6,ErrorMessage ="Şifre en az 6 karakter olmalıdır")]
        [MaxLength(50,ErrorMessage ="Şifre en fazla 50 karakter olabilir")]
        public required string Password { get; set; }

        public int DepartmentId { get; set; }

       
    }
}
