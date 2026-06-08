using AssessmentService.Data;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssessmentService.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly AssessmentDbContext _context;

        public QuestionRepository(AssessmentDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Question question)
        {
            await _context.Questions.AddAsync(question);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Question>> GetAllAsync()
        {

            return await _context.Questions
                .Include(q => q.TestCases)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task UpdateAsync(Question question)
        {
            _context.Questions.Update(question);
            await _context.SaveChangesAsync();
        }
        public async Task<Question?> GetByIdAsync(int id)
        {
            return await _context.Questions
                .Include(q => q.TestCases)
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task DeleteAsync(Question question)
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Question>> GetByAssessmentAsync(int assessmentId)
        {
            return await _context.AssessmentQuestions
    .Where(aq => aq.AssessmentId == assessmentId)
    .Include(aq => aq.Question)
        .ThenInclude(q => q.TestCases)   // ✅ FIX
    .Select(aq => aq.Question)
    .AsNoTracking()
    .ToListAsync();
        }
    }
}