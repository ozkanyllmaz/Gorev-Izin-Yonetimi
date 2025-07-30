using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GorevIzinSistemi.Migrations
{
    /// <inheritdoc />
    public partial class ManagerResponseFieldAddedToLeaveAndLeaveDto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManagerResponse",
                table: "Leaves",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManagerResponse",
                table: "Leaves");
        }
    }
}
