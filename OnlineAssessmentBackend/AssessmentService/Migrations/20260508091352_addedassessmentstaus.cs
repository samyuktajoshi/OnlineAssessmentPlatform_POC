using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssessmentService.Migrations
{
    /// <inheritdoc />
    public partial class addedassessmentstaus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AvailableFrom",
                table: "Assessments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AvailableUntil",
                table: "Assessments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Assessments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableFrom",
                table: "Assessments");

            migrationBuilder.DropColumn(
                name: "AvailableUntil",
                table: "Assessments");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Assessments");
        }
    }
}
