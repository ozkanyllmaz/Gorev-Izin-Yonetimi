using System.ComponentModel.DataAnnotations;
using LeaveType = GorevIzinSistemi.Models.Entities.LeaveType;
using StatusType = GorevIzinSistemi.Models.Entities.StatusType;

namespace GorevIzinSistemi.Models.DTO
{
    public class LeaveCreateDto
    {
        [Required(ErrorMessage = "İzin tipi boş bırakılamaz")]
        public required LeaveType leaveType { get; set; }

        [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter içerebilir")]
        public string? Description { get; set; }

        [Required(ErrorMessage ="Başlangıç tarihi boş bırakılamaz")]
        public required DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Bitiş tarihi boş bırakılamaz")]
        public required DateTime EndDate { get; set; }

    }
}
