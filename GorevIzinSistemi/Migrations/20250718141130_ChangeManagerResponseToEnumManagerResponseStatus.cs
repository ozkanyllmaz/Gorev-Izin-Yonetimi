using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GorevIzinSistemi.Migrations
{
    /// <inheritdoc />
    public partial class ChangeManagerResponseToEnumManagerResponseStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManagerResponse",
                table: "Leaves");

            migrationBuilder.AddColumn<int>(
                name: "managerResponseStatus",
                table: "Leaves",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "managerResponseStatus",
                table: "Leaves");

            migrationBuilder.AddColumn<string>(
                name: "ManagerResponse",
                table: "Leaves",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
