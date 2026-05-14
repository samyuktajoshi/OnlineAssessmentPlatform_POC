using ResultService.Data;
using ResultService.Models;
using ResultService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ResultService.Repositories
{
    public class ResultRepository : IResultRepository
    {
        private readonly ResultDbContext _context;

        public ResultRepository(ResultDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Result result)
        {
            await _context.Results.AddAsync(result);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Result>> GetAllAsync()
        {
            return await _context.Results
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Result>> GetByUserIdAsync(int userId)
        {
            return await _context.Results
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Result>> GetByAssessmentIdAsync(int assessmentId)
        {
            return await _context.Results
                .AsNoTracking()
                .Where(r => r.AssessmentId == assessmentId)
                .ToListAsync();
        }
        public async Task<Result?> GetBySubmissionIdAsync(int submissionId)
        {
            return await _context.Results
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.SubmissionId == submissionId);
        }

    }
}