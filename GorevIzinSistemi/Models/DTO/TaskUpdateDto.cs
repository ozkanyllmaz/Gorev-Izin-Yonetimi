using System.ComponentModel.DataAnnotations;

namespace GorevIzinSistemi.Models.DTO
{
    public class TaskUpdateDto
    {
        [Required(ErrorMessage = "Görev başlığı zorunludur")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Görev başlığı 3-200 karakter arasında olmalıdır")]
        public required string Title { get; set; }


        [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter içerebilir")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi zorunludur")]
        public required DateTime StartDate { get; set; }


        [Required(ErrorMessage = "Bitiş tarihi zorunludur")]
        public required DateTime EndDate { get; set; }


        [Required(ErrorMessage = "Durum alanı zorunludur")]
        public required string Status { get; set; } = "Pending";
    }
}
