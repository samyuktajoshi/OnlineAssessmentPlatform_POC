using Microsoft.EntityFrameworkCore;
using SubmissionService.Models;

namespace SubmissionService.Data
{
    public class SubmissionDbContext : DbContext
    {
        public SubmissionDbContext(DbContextOptions<SubmissionDbContext> options)
            : base(options) { }

        public DbSet<Submission> Submissions { get; set; }
        public DbSet<SubmissionAnswer> SubmissionAnswers { get; set; }
    }
}