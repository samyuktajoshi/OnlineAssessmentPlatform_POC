using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubmissionService.Migrations
{
    /// <inheritdoc />
    public partial class AddIsCorrectToSubmissionAnswer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCorrect",
                table: "SubmissionAnswers",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCorrect",
                table: "SubmissionAnswers");
        }
    }
}
