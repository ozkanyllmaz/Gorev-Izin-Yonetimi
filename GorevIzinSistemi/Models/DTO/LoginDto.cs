using System.ComponentModel.DataAnnotations;

namespace GorevIzinSistemi.Models.DTO
{
    public class LoginDto
    {
        [Required(ErrorMessage ="Email alanı zorunludur")]
        [EmailAddress(ErrorMessage ="Geçerli bir email adresi giriniz")]
        public required string Email {  get; set; }


        [Required(ErrorMessage ="Şifre alanını zorunludur")]
        public required string Password { get; set; }
    }
}
