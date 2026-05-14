using AssessmentService.Models;
using Microsoft.EntityFrameworkCore;

namespace AssessmentService.Data
{
    public class AssessmentDbContext : DbContext
    {
        public AssessmentDbContext(DbContextOptions<AssessmentDbContext> options)
            : base(options) { }

        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<AssessmentQuestion> AssessmentQuestions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Composite Key
            modelBuilder.Entity<AssessmentQuestion>()
                .HasKey(aq => new { aq.AssessmentId, aq.QuestionId });

            // Relationship: Assessment → Mapping
            modelBuilder.Entity<AssessmentQuestion>()
                .HasOne(aq => aq.Assessment)
                .WithMany(a => a.AssessmentQuestions)
                .HasForeignKey(aq => aq.AssessmentId);

            // Relationship: Question → Mapping
            modelBuilder.Entity<AssessmentQuestion>()
                .HasOne(aq => aq.Question)
                .WithMany(q => q.AssessmentQuestions)
                .HasForeignKey(aq => aq.QuestionId);
        }
    }
}