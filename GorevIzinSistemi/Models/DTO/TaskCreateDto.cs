using System.ComponentModel.DataAnnotations;
using TaskStatus = GorevIzinSistemi.Models.Entities.TaskStatus;

namespace GorevIzinSistemi.Models.DTO
{
    public class TaskCreateDto
    {
        [Required(ErrorMessage ="Görev başlığı zorunludur")]
        [StringLength(200, MinimumLength = 3, ErrorMessage ="Görev başlığı 3-200 karakter arasında olmalıdır")]
        public required string Title { get; set; }


        [MaxLength(1000,ErrorMessage ="Açıklama en fazla 1000 karakter içerebilir")]
        public string? Description { get; set; }

        [Required(ErrorMessage ="Başlangıç tarihi zorunludur")]
        public required DateTime StartDate { get; set; }


        [Required(ErrorMessage ="Bitiş tarihi zorunludur")]
        public required DateTime EndDate { get; set; }


        [Required(ErrorMessage = "Durum alanı zorunludur")]
        public required TaskStatus Status { get; set; } = TaskStatus.Pending;
    }
}
