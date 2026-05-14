using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace AssessmentService.Data
{
    public class AssessmentDbContextFactory
        : IDesignTimeDbContextFactory<AssessmentDbContext>
    {
        public AssessmentDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AssessmentDbContext>();

            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            optionsBuilder.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")
            );

            return new AssessmentDbContext(optionsBuilder.Options);
        }
    }
}