using AssessmentService.Data;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssessmentService.Repositories
{
    public class AssessmentQuestionRepository : IAssessmentQuestionRepository
    {
        private readonly AssessmentDbContext _context;

        public AssessmentQuestionRepository(AssessmentDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AssessmentQuestion aq)
        {
            await _context.AssessmentQuestions.AddAsync(aq);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int assessmentId, int questionId)
        {
            return await _context.AssessmentQuestions
                .AsNoTracking()
                .AnyAsync(x => x.AssessmentId == assessmentId && x.QuestionId == questionId);
        }

        public async Task<AssessmentQuestion?> GetAsync(int assessmentId, int questionId)
        {
            return await _context.AssessmentQuestions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.AssessmentId == assessmentId && x.QuestionId == questionId);
        }
        public async Task<List<AssessmentQuestion>> GetByAssessmentIdAsync(int assessmentId)
        {
            return await _context.AssessmentQuestions
                .AsNoTracking()
                .Where(x => x.AssessmentId == assessmentId)
                .Include(x => x.Question)
                .ToListAsync();
        }

        public async Task DeleteAsync(AssessmentQuestion aq)
        {
            _context.AssessmentQuestions.Remove(aq);
            await _context.SaveChangesAsync();
        }
    }
}