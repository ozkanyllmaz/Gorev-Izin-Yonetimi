using GorevIzinSistemi.Models.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GorevIzinSistemi.Models.DTO
{
    public class LeaveUpdateDto
    {
        [Required(ErrorMessage = "İzin tipi boş bırakılamaz")]
        public required LeaveType leaveType { get; set; }

        [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter içerebilir")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi boş bırakılamaz")]
        public required DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Bitiş tarihi boş bırakılamaz")]
        public required DateTime EndDate { get; set; }
    }
}
