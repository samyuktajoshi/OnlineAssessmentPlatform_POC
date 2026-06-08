using AssessmentService.Data;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssessmentService.Repositories
{
    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly AssessmentDbContext _context;

        public AssessmentRepository(AssessmentDbContext context)
        {
            _context = context;
        }

        // ✅ CREATE
        public async Task AddAsync(Assessment assessment)
        {
            await _context.Assessments.AddAsync(assessment);
            await _context.SaveChangesAsync();
        }

        // ✅ GET ALL (for candidate)
        public async Task<List<Assessment>> GetAllAsync()
        {
            return await _context.Assessments
        .AsNoTracking()
.ToListAsync();
        }

        // ✅ GET BY ID
        public async Task<Assessment?> GetByIdAsync(int id)
        {
            return await _context.Assessments
                .AsNoTracking()
                .Include(a => a.AssessmentQuestions)
                .ThenInclude(aq => aq.Question)
                .ThenInclude(q => q.TestCases)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        // ✅ GET BY ADMIN (for "My Assessments")
        public async Task<List<Assessment>> GetByAdminIdAsync(int adminId)
        {
            return await _context.Assessments
                .AsNoTracking()
                .Where(a => a.CreatedBy == adminId)
                .ToListAsync();
        }

        // ✅ UPDATE
        public async Task UpdateAsync(Assessment assessment)
        {
            _context.Assessments.Update(assessment);
            await _context.SaveChangesAsync();
        }

        // ✅ DELETE
        public async Task DeleteAsync(Assessment assessment)
        {
            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();
        }
    }
}